const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

export async function rankResumes(jobDescription, resumes) {
  const formData = new FormData();
  formData.append("job_description", jobDescription);

  for (const resume of resumes) {
    formData.append("resumes", resume);
  }

  const response = await fetch(`${API_BASE_URL}/rank-resumes`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Resume ranking failed");
  }

  return response.json();
}

export async function extractDocumentText(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/extract-text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to extract text from document");
  }

  return response.json();
}
