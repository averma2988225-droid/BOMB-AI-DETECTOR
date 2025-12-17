import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are SENTINEL AI, an advanced security threat detection system. Analyze the uploaded image and classify any objects detected.

STRICT CLASS TAXONOMY:
- firearm: handgun, rifle, shotgun, gun-like shapes, weapons
- explosive_device: IED, bomb, detonator, explosive materials (requires ≥2 supporting components like wires + container)
- suspicious_component: wires, batteries, timers, unusual circuitry (alone does NOT imply explosive)
- benign_object: bags, electronics, tools, everyday items

CRITICAL RULES:
1. A firearm MUST NEVER be classified as suspicious_component or wire_bundle
2. explosive_device requires ≥2 supporting components (wiring + container, battery + timer, etc.)
3. suspicious_component alone does NOT indicate an explosive
4. Look for firearm features: barrel structure, trigger guard, grip geometry, metallic frame

VISUAL FEATURE DETECTION:
For firearms, look for:
- barrel_structure: Cylindrical barrel
- trigger_guard: Trigger mechanism
- grip_geometry: Handle/grip shape
- metallic_frame: Metal construction
- slide_mechanism: Slide/action

For explosives, look for:
- wire_bundle: Visible wiring
- battery_pack: Power source
- timer_display: Timer/electronics
- container: Housing/casing
- detonator: Detonation mechanism

RESPOND IN EXACT JSON FORMAT:
{
  "detected": true/false,
  "primaryClass": "firearm"|"explosive_device"|"suspicious_component"|"benign_object",
  "confidence": 0.0-1.0,
  "secondaryClass": "class_name"|null,
  "secondaryConfidence": 0.0-1.0|null,
  "detectedFeatures": [
    {"name": "feature_name", "confidence": 0.0-1.0, "description": "what was detected"}
  ],
  "explanation": "Brief explanation of what was detected and why",
  "threatIndicators": {
    "hasFirearmFeatures": true/false,
    "hasExplosiveComponents": true/false,
    "componentCount": number
  }
}

Be accurate. Do not hallucinate threats. If the image shows ordinary objects, classify as benign_object with high confidence.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, isXray } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing image with Lovable AI...');
    console.log('Image modality:', isXray ? 'X-RAY' : 'RGB');

    const modalityContext = isXray 
      ? 'This is an X-RAY scan image. You can see internal structures, wiring, and components that would not be visible in a normal photo.'
      : 'This is a standard RGB photograph. Only analyze visually apparent features - do not assume internal components.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: `${modalityContext}\n\nAnalyze this image for security threats. Provide your analysis in the exact JSON format specified.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ success: false, error: 'No analysis result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI response:', content);

    // Parse JSON from response (handle markdown code blocks)
    let analysisResult;
    try {
      let jsonStr = content;
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Content was:', content);
      
      // Return a fallback response for ambiguous cases
      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            detected: true,
            primaryClass: 'benign_object',
            confidence: 0.5,
            secondaryClass: null,
            secondaryConfidence: null,
            detectedFeatures: [],
            explanation: content,
            threatIndicators: {
              hasFirearmFeatures: false,
              hasExplosiveComponents: false,
              componentCount: 0
            },
            isAmbiguous: true
          },
          modality: isXray ? 'X-RAY' : 'RGB'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete:', analysisResult.primaryClass, 'confidence:', analysisResult.confidence);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        modality: isXray ? 'X-RAY' : 'RGB'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-threat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
