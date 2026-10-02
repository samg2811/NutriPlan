// Send photo to Gemini
async function analyzeFood() {
  if (!selectedImage) return;

  setIsAnalyzing(true);
  setAnalysisError("");
  setDetectedFoods([]);

  try {
    // Clean base64 string by stripping the "data:image/...;base64," prefix
    const base64Data = selectedImage.includes(",")
      ? selectedImage.split(",")[1]
      : selectedImage;

    const response = await fetch("/api/analyze-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Image: base64Data,
        mimeType: imageMimeType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // THIS WILL DISPLAY THE REAL ERROR MESSAGE FROM THE SERVER
      throw new Error(data.error || `Server Error ${response.status}: Failed to process image`);
    }

    const foods: string[] = data.detectedIngredients || data.foods || [];

    if (foods.length === 0) {
      setAnalysisError("No identifiable food items found in this photo.");
    } else {
      setDetectedFoods(foods);
    }
  } catch (error: any) {
    console.error("Analysis Error:", error);
    // Display the actual error message on screen instead of generic fallback
    setAnalysisError(error.message || "We couldn't analyze that photo. Please try another image.");
  } finally {
    setIsAnalyzing(false);
  }
}
