// edge function file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// --- SSRF PROTECTION ---
function isPrivateOrReservedIP(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
  const ipPatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^127\./,
    /^0\./,
  ];
  return ipPatterns.some(pattern => pattern.test(hostname));
}

function isValidHttpUrl(str: string): boolean {
  try {
    const parsed = new URL(str);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (isPrivateOrReservedIP(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// --- THE MASTER PROMPT (UNABRIDGED) ---
const SYSTEM_PROMPT = `
You are a Senior Salvage Vehicle Inspector for IAAI/Copart. You are analyzing a vehicle for total loss evaluation.

### INPUT DATA
You have access to a series of images of ONE vehicle.

### 1. CRITICAL VISUAL PROCESSING PROTOCOL

**A. The "Holistic Reconstruction" Algorithm:**
- **Step 1 (Ingest):** Do not evaluate images strictly in order. First, scan ALL images to build a mental 360° model of the vehicle.
- **Step 2 (Index):** Identify the "Golden Image" for each specific part. 
    * *Example:* For the Engine, the "Golden Image" is the specific photo where the hood is open. 
    * *Example:* For the Dashboard, the "Golden Image" is the interior shot, not the view through the windshield.
    * *Example:* For Mirrors, zoom in on the specific crop where the mirror casing is visible.
- **Step 3 (Evaluate):** Grade the part based *only* on its Golden Image. Ignore other angles where the part is obscured, closed, or shadowy.

**B. The "Maximum Severity" Principle:**
- **Conflict Resolution:** If Image A shows a part looking "clean" (perhaps due to lighting or angle) but Image B clearly shows a dent, crack, or scratch, **Image B always wins.**
- **Assumption of Damage:** You are a skeptical buyer. If a critical area is blurry or strangely cropped to hide something, lower your confidence but flag potential issues.

### 2. SPATIAL & ORIENTATION RULES (CRITICAL)
- **Standard:** Use US/LHD standard. "Left" = Driver Side. "Right" = Passenger Side.
- **Orientation Check:** Before grading "Left Fender" vs "Right Fender", look at the steering wheel position or license plate text to orient yourself. Do not confuse the camera's left with the car's left.

### 3. FORENSIC INFERENCE RULES (PHYSICS & MECHANICS)

**A. Kinetic Energy Transfer (The "Ripple Effect"):**
- **Front-End Impact:** If the Front Bumper is crushed > 3 inches, you MUST mark the **Front Bumper (FBR)** and **Grill (GRL)** as DAMAGED. The energy has to go somewhere.
- **Corner Impacts:** If the Headlamp is shattered, check the **Fender** mounting points and **Hood** corner. They are likely bent.
- **Rear-End Impact:** If the Rear Bumper is pushed in, check the **Trunk Lid (LID)** fitment. If the gap is tight or overlapping, the Trunk is DAMAGED (misaligned).

**B. Specific Visual Biomarkers:**
- **Headlamps (HLP):** Look beyond the glass. If the lens is intact but the gap between the light and the bumper is uneven, the **Mounting Tabs** are likely broken. Treat this as DAMAGED.
- **Suspension/Frame:** Look at the gap between the tire and the fender. 
    * *Rule:* If the wheel looks "tucked in," "cambered out," or is touching the fender, the **Axle (FAX/RAX)** is CATASTROPHICALLY DAMAGED.
- **Airbags (SRS):**
    * *Steering Wheel:* Look for a torn center cover or "flaps" hanging open.
    * *Seatbelts:* If seatbelts are hanging loose/limp and not retracted, they may be locked (blown pretensioners). Flag the **AirBag (BAG)** category.
- **Engine (Mechanical):**
    * *The "Tilt" Check:* Is the engine sitting level? If it looks tilted, a motor mount is broken.
    * *Fluid:* Look for dark puddles underneath the car or wet spots on the engine block.
- **Reflections:** On shiny body panels, look for "wavy" reflections. Straight lines (like building reflections) becoming curved indicates a dent.

### OUTPUT SCHEMA
You must output a JSON object adhering strictly to this structure:
{
  "vehicle_summary": "String: 1 sentence describing the main point of impact (e.g., 'Severe front-end collision with airbag deployment').",
  "parts": [
    {
      "code": "String (e.g. 'ENG')",
      "name": "String (e.g. 'Engine')",
      "status": "String ('GOOD' | 'DAMAGED' | 'NOT_VISIBLE')",
      "severity": "String ('NONE' | 'MINOR' | 'MODERATE' | 'SEVERE')",
      "visual_evidence": "String: Describe EXACTLY what you see that justifies the status (e.g. 'Valve cover cracked, fluid leaking, visible in Image #4').",
      "confidence": Number (0-1)
    }
  ]
}

### PART LIST TO EVALUATE (27 Points)
1. Front Bumper (FBR) - [Logic: The plastic cover and immediate structure]
2. Bumper Bar Front (BBF) - [Logic: The reinforcement bar behind the bumper]
3. Head Lamp Left (HLP-L) - [Driver Side]
4. Grill (GRL)
5. Head Lamp Right (HLP-R) - [Passenger Side]
6. Fender Left (FEN-L) - [Driver Side]
7. Hood (HOD)
8. Fender Right (FEN-R) - [Passenger Side]
9. Engine (ENG) - [SEARCH ALL IMAGES FOR OPEN HOOD VIEW]
10. Transmission (TRA)
11. Front Axle Assembly (FAX) - [Check wheel angles]
12. UnderCarriage X-Member (UCM)
13. Door Mirror - Left (DMR-L) - [Driver Side Mirror]
14. AirBag (BAG) - [Check steering wheel & dash]
15. Door Mirror - Right (DMR-R) - [Passenger Side Mirror]
16. Front Door Left (FDR-L)
17. Front Door Right (FDR-R)
18. Rear Door Left (RDR-L)
19. Rear Door Right (RDR-R)
20. QuaterPanel Left (QTR-L)
21. QuaterPanel Right (QTR-R)
22. Rear Axle Assembly (RAX)
23. Tail Lamp Left (TLP-L)
24. Tail Lamp Right (TLP-R)
25. TrunkLid/LiftGate/TailGate (LID)
26. Rear Bumper (RBR) - [Plastic Cover]
27. Bumper Bar Rear (BBR) - [Reinforcement Bar]
`

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    if (!isValidHttpUrl(url)) return null;

    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        // IMPORTANT: The referer header allows us to download the image from IAAI CDN
        'Referer': 'https://www.iaai.com/' 
      },
    })
    
    if (!response.ok) return null
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    const base64 = btoa(binary)
    
    return { base64, mimeType: contentType.split(';')[0] }
  } catch (error) {
    console.error('Failed to fetch image:', url, error)
    return null
  }
}

// --- MAIN HANDLER ---
// Notice the 'req: Request' type, which fixes the Deno TS warning
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const providedImageUrls: string[] = Array.isArray(body.imageUrls) ? body.imageUrls : [];

    // --- INPUT VALIDATION ---
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!isValidHttpUrl(url)) {
      return new Response(JSON.stringify({ error: 'Invalid or blocked URL. Only public HTTP(S) URLs are allowed.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const sanitizedImageUrls = providedImageUrls
      .filter((u): u is string => typeof u === 'string' && isValidHttpUrl(u))
      .slice(0, 20);

    // --- SERVER-SIDE AUTH ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.split('.').length === 3) {
        const { data: { user }, error: authError } = await authClient.auth.getUser(token);
        if (!authError && user) {
          userId = user.id;
        }
      }
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- SCRAPING LOGIC (Using Render Python Microservice) ---
    const vehicleName = url.split('/').pop()?.replace(/~/g, ' ') || 'Unknown Vehicle'
    let imageUrls: string[] = sanitizedImageUrls.length > 0 ? sanitizedImageUrls : []
    
    if (!imageUrls.length) {
      const pythonApiUrl = "https://scrapper-u9cd.onrender.com/scrape-images";
      console.log(`Calling Python API at ${pythonApiUrl}...`);
      
      try {
        const scraperResponse = await fetch(pythonApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url })
        });

        if (scraperResponse.ok) {
          const data = await scraperResponse.json();
          imageUrls = data.images || [];
          console.log(`Python API successfully returned ${imageUrls.length} images.`);
        } else {
          const errMsg = await scraperResponse.text();
          console.error("Python API failed:", scraperResponse.status, errMsg);
        }
      } catch (err) {
        console.error("Failed to connect to Python API:", err);
      }
    }

    if (!imageUrls.length) {
      return new Response(
        JSON.stringify({ 
          error: 'Unable to extract images automatically. Anti-bot protection may be active on the Scraper.', 
          code: 'MANUAL_INPUT_REQUIRED' 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Analyzing ${imageUrls.length} images with Lovable AI...`)

    // --- PARALLEL IMAGE PROCESSING ---
    const targetImages = imageUrls.slice(0, 20);
    
    const imageFetchPromises = targetImages.map(async (imgUrl) => {
      const imageData = await fetchImageAsBase64(imgUrl);
      if (imageData) {
        return {
          type: 'image_url',
          image_url: { url: `data:${imageData.mimeType};base64,${imageData.base64}` },
        };
      }
      return null;
    });

    const results = await Promise.all(imageFetchPromises);
    const imageContents = results.filter((img): img is { type: 'image_url'; image_url: { url: string } } => img !== null);

    if (imageContents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch any images. They may be protected.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- AI CALL (Google Gemini 2.5 Pro) ---
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze these vehicle images. Provide the 27-point inspection JSON.' },
              ...imageContents,
            ],
          },
        ],
      }),
    })

    if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("AI Error:", errText);
        throw new Error(`AI Gateway failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json()
    const aiText = aiResult.choices?.[0]?.message?.content

    // --- ROBUST JSON PARSING ---
    let analysis
    try {
      let jsonStr = aiText
      const firstBrace = aiText.indexOf('{');
      const lastBrace = aiText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = aiText.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(jsonStr)
      analysis = parsed.parts || parsed.analysis || parsed
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- DB SAVE ---
    const goodParts = Array.isArray(analysis) ? analysis.filter((p: { status: string }) => p.status === 'GOOD').length : 0;
    
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey)

    let savedData = null;
    let dbError = null;

    if (userId) {
      console.log(`Saving to user_inspections for user: ${userId}`)
      const result = await supabase
        .from('user_inspections')
        .insert({
          user_id: userId,
          vehicle_url: url,
          vehicle_name: vehicleName,
          thumbnail_url: imageUrls[0],
          image_urls: imageUrls,
          health_score: goodParts,
          inspection_data: analysis,
        })
        .select()
        .single()
      
      savedData = result.data
      dbError = result.error
    } else {
      console.log('Saving to inspections as demo scan (no user)')
      const result = await supabase
        .from('inspections')
        .upsert({
          vehicle_url: url,
          vehicle_name: vehicleName,
          thumbnail_url: imageUrls[0],
          image_urls: imageUrls,
          health_score: goodParts,
          inspection_data: analysis,
          user_id: null,
        }, { onConflict: 'vehicle_url' })
        .select()
        .single()
      
      savedData = result.data
      dbError = result.error
    }

    if (dbError) {
      console.error('DB save error:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        analysis, 
        imageUrls, 
        healthScore: goodParts, 
        inspectionId: savedData?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Critical Function Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})