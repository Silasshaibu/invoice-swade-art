interface Window {
  electronAPI?: {
    printToPDF: () => Promise<Uint8Array | null>
    platform: string
  }
}
