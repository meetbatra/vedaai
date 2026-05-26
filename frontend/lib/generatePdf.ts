export async function downloadAssignmentPdf(
  assignmentId: string,
  filename: string,
): Promise<void> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  const response = await fetch(`${backendUrl}/api/assignments/${assignmentId}/pdf`);
  if (!response.ok) {
    throw new Error(`Failed to generate PDF (${response.status})`);
  }

  const blob = await response.blob();
  const file = new Blob([blob], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(file);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
