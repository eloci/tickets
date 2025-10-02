'use client'

import { useState, useRef, useEffect } from 'react'
import { validateQRCode, ValidationResult } from '@/lib/qr-generator'
import { toast } from 'react-hot-toast'
import {
  CheckCircle,
  XCircle,
  Clock,
  Scan,
  Camera,
  CameraOff,
  Type,
  Upload,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react'

// Dynamic import for qr-scanner to avoid SSR issues
let QrScanner: any = null
if (typeof window !== 'undefined') {
  import('qr-scanner').then((module) => {
    QrScanner = module.default
  })
}

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'upload'>('camera')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize barcode detector
  useEffect(() => {
    const initDetector = async () => {
      if ('BarcodeDetector' in window) {
        try {
          // @ts-ignore
          detectorRef.current = new BarcodeDetector({
            formats: ['qr_code']
          })
          console.log('BarcodeDetector initialized successfully')
        } catch (error) {
          console.log('BarcodeDetector initialization failed, will use qr-scanner fallback')
          detectorRef.current = null
        }
      } else {
        console.log('BarcodeDetector not available, will use qr-scanner fallback')
        detectorRef.current = null
      }
    }

    initDetector()

    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraActive(false)
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      setScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        startScanning()
      }
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Unable to access camera. Please check permissions or use manual input.')
      toast.error('Camera access denied')
      setScanMode('manual')
    } finally {
      setScanning(false)
    }
  }

  const startScanning = () => {
    if (!detectorRef.current && !QrScanner) {
      toast.error('No QR detection method available')
      return
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        try {
          const canvas = canvasRef.current
          const video = videoRef.current
          const ctx = canvas.getContext('2d')

          if (!ctx) return

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          let qrData = null

          if (detectorRef.current) {
            const barcodes = await detectorRef.current.detect(canvas)
            if (barcodes.length > 0) {
              qrData = barcodes[0].rawValue
            }
          } else if (QrScanner) {
            try {
              qrData = await QrScanner.scanImage(canvas, {
                returnDetailedScanResult: false
              })
            } catch (error) {
              // Ignore scan errors during continuous scanning
            }
          }

          if (qrData) {
            handleScan(qrData)
            stopCamera()
          }
        } catch (error) {
          // Ignore detection errors, continue scanning
        }
      }
    }, 100)
  }

  const handleScan = async (qrData: string) => {
    setScanning(true)
    try {
      const clientCheck = validateQRCode(qrData)
      setScanResult(clientCheck)

      if (!clientCheck.isValid) {
        toast.error('❌ Invalid ticket signature')
        return
      }
      if (clientCheck.isExpired) {
        toast.error('⏰ Ticket has expired')
      }

      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, markUsed: true })
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || 'Server validation failed')
        return
      }

      if (data.isValid && !data.isExpired) {
        if (data.alreadyUsed) {
          toast('⚠️ Ticket already used', { icon: '⚠️' } as any)
        } else {
          toast.success('✅ Ticket verified and marked as USED')
        }
      } else if (data.isExpired) {
        toast.error('⏰ Ticket expired')
      } else {
        toast.error('❌ Invalid ticket')
      }

      setScanResult((prev) => ({
        ...(prev || clientCheck),
        isValid: !!data.isValid,
        isExpired: !!data.isExpired,
        ticketData: clientCheck.ticketData,
        error: data.reason || (prev && prev.error)
      }))
    } catch (error) {
      toast.error('Error scanning ticket')
      console.error('Scan error:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setImageFile(file)
    setScanning(true)

    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)

    processImageForQR(file)
  }

  const processImageForQR = async (file: File) => {
    try {
      if (detectorRef.current) {
        await processWithBarcodeDetector(file)
      } else if (QrScanner) {
        await processWithQrScanner(file)
      } else {
        toast.error('QR detection not supported in this browser. Please use manual input.')
        setScanning(false)
      }
    } catch (error) {
      console.error('Image processing error:', error)
      toast.error('Error processing image')
      setScanning(false)
    }
  }

  const processWithBarcodeDetector = async (file: File) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      toast.error('Canvas not supported')
      setScanning(false)
      return
    }

    img.onload = async () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const barcodes = await detectorRef.current.detect(canvas)

        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue
          if (qrData) {
            toast.success('🔍 QR code detected from image!')
            handleScan(qrData)
          } else {
            toast.error('No QR code data found')
          }
        } else {
          toast.error('No QR code detected in image')
        }
      } catch (error) {
        console.error('BarcodeDetector error:', error)
        toast.error('Failed to detect QR code in image')
      } finally {
        setScanning(false)
      }
    }

    img.onerror = () => {
      toast.error('Failed to load image')
      setScanning(false)
    }

    img.src = URL.createObjectURL(file)
  }

  const processWithQrScanner = async (file: File) => {
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: false
      })

      if (result) {
        toast.success('📱 QR code detected from image!')
        handleScan(result)
      } else {
        toast.error('No QR code detected in image')
      }
    } catch (error: any) {
      // Check if the error is just "No QR code found" which is expected
      const errorMessage = error?.message || error?.toString() || ''
      if (errorMessage.toLowerCase().includes('no qr code found') ||
        errorMessage.toLowerCase().includes('no qr code detected')) {
        toast.error('No QR code detected in image')
      } else {
        // Only log actual errors, not "no QR code found" cases
        console.error('QrScanner error:', error)
        toast.error('Failed to process image for QR detection')
      }
    } finally {
      setScanning(false)
    }
  }

  const clearUploadedImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage(null)
    setImageFile(null)
    setScanResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleManualScan = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter QR code data')
      return
    }
    handleScan(manualInput)
    setManualInput('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎫 QR Ticket Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced crypto-signed ticket validation with camera scanning and real-time verification
          </p>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-200">
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setScanMode('camera')
                  setScanResult(null)
                  clearUploadedImage()
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${scanMode === 'camera'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </button>
              <button
                onClick={() => {
                  setScanMode('upload')
                  stopCamera()
                  setScanResult(null)
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${scanMode === 'upload'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </button>
              <button
                onClick={() => {
                  setScanMode('manual')
                  stopCamera()
                  setScanResult(null)
                  clearUploadedImage()
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${scanMode === 'manual'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Type className="h-4 w-4" />
                <span>Manual</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {scanMode === 'camera' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera Scanner</h2>
                <p className="text-gray-600">Point your camera at a QR code to scan instantly</p>
              </div>

              {!cameraActive ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="h-12 w-12 text-blue-600" />
                  </div>

                  {cameraError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Camera Error</span>
                      </div>
                      <p className="text-red-600 text-sm mt-1">{cameraError}</p>
                    </div>
                  )}

                  <button
                    onClick={startCamera}
                    disabled={scanning}
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    <Camera className="h-5 w-5" />
                    <span>{scanning ? 'Starting Camera...' : 'Start Camera'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-80 object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400"></div>
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Scanning...</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <CameraOff className="h-4 w-4" />
                      <span>Stop Camera</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {scanMode === 'upload' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload QR Image</h2>
                <p className="text-gray-600">Upload a PNG, JPG, or other image file containing a QR code</p>
              </div>

              <div className="max-w-2xl mx-auto">
                {!uploadedImage ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ImageIcon className="h-12 w-12 text-green-600" />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={scanning}
                      className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      <Upload className="h-5 w-5" />
                      <span>{scanning ? 'Processing...' : 'Choose Image File'}</span>
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                      Supports PNG, JPG, JPEG, GIF, and other image formats
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Uploaded Image:</h3>
                        <button
                          onClick={clearUploadedImage}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden max-h-96">
                        <img
                          src={uploadedImage}
                          alt="Uploaded QR code"
                          className="w-full h-auto object-contain"
                        />
                      </div>

                      {imageFile && (
                        <div className="mt-3 text-sm text-gray-600">
                          <p><strong>File:</strong> {imageFile.name}</p>
                          <p><strong>Size:</strong> {(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => imageFile && processImageForQR(imageFile)}
                        disabled={scanning || !imageFile}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                      >
                        <Scan className="h-5 w-5" />
                        <span>{scanning ? 'Scanning...' : 'Scan QR Code'}</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Choose Different Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {scanMode === 'manual' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Manual Input</h2>
                <p className="text-gray-600">Paste or type the QR code data below</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  <textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste the QR code data here..."
                    className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm font-mono"
                  />
                  <button
                    onClick={handleManualScan}
                    disabled={scanning || !manualInput.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    <Scan className="h-5 w-5" />
                    <span>{scanning ? 'Validating...' : 'Validate Ticket'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="border-t border-gray-200 p-6">
              <div className="border-2 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {scanResult.isValid && !scanResult.isExpired ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : scanResult.isExpired ? (
                      <Clock className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        Validation Result
                      </h3>
                      {scanResult.isValid && !scanResult.isExpired && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          ✅ VALID
                        </span>
                      )}
                      {scanResult.isExpired && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          ⏰ EXPIRED
                        </span>
                      )}
                      {!scanResult.isValid && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                          ❌ INVALID
                        </span>
                      )}
                    </div>

                    {scanResult.error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="text-red-700 font-semibold">Error Details:</span>
                        </div>
                        <p className="text-red-600 mt-1">{scanResult.error}</p>
                      </div>
                    )}

                    {scanResult.ticketData && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Ticket ID
                            </label>
                            <p className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg">
                              {scanResult.ticketData.ticketId}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Event
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              {scanResult.ticketData.eventTitle}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Customer Email
                            </label>
                            <p className="text-sm text-gray-900">
                              {scanResult.ticketData.userEmail}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Seat Assignment
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              {scanResult.ticketData.seatNumber}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Event Date & Time
                            </label>
                            <p className="text-sm text-gray-900">
                              {new Date(scanResult.ticketData.eventDate).toLocaleDateString()} at {scanResult.ticketData.eventTime}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Venue
                            </label>
                            <p className="text-sm text-gray-900">
                              {scanResult.ticketData.venue}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">🔒 Advanced Security Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Crypto-signed validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Real-time expiry checking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Scan className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Instant usage tracking</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                <strong>How it works:</strong> Each ticket contains encrypted data with HMAC signatures.
                Valid tickets are automatically marked as USED to prevent duplicate entry.
                <br />
                <span className="text-xs text-gray-500 mt-1 block">
                  📱 Compatible with all browsers - uses native BarcodeDetector when available, with intelligent fallback for maximum compatibility.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Clear Result Button */}
        {scanResult && (
          <div className="text-center mt-6">
            <button
              onClick={() => setScanResult(null)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Result & Scan Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}