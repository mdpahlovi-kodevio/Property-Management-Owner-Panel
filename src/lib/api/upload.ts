import { request } from './base'

export async function uploadImage(file: File, folder?: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const path = folder ? `/upload/image?folder=${encodeURIComponent(folder)}` : '/upload/image'

    const { url } = await request<{ url: string }>(path, {
        method: 'POST',
        body: formData,
    })
    return url
}

export async function deleteImage(url: string): Promise<void> {
    await request(`/upload/image?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
    })
}
