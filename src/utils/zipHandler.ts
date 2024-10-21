import JSZip from 'jszip'

export const createZip = async (files: { blob: Blob; fileName: string }[]): Promise<Blob> => {
  const zip = new JSZip()

  files.forEach(({ blob, fileName }) => {
    zip.file(fileName, blob)
  })

  return await zip.generateAsync({ type: 'blob' })
}
