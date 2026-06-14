import {TUseFileAttachmentOptions, TUseFileAttachmentReturn} from '@flowhq/shared'
import { useEffect, useRef, useState } from 'react'



export default function useFileAttachment(
    options: TUseFileAttachmentOptions
) {

    const { maxSizeMB = 16 } = options
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement | null>(null)

}