import jsPDF from 'jspdf'

export type VisitStatus = 'approved' | 'pending' | 'denied'
export type VisitType = 'guest' | 'delivery' | 'event'

export type VisitRecord = {
  id: string
  visitorName: string
  visitorEmail?: string
  vehiclePlate?: string
  hostName: string
  hostUnit: string
  siteSlug: string
  siteName: string
  scheduledFor: string
  status: VisitStatus
  type: VisitType
  badgeCode: string
  createdAt: string
  requestedByName?: string
  requestedByEmail?: string
  requestedByRole?: string
  requestedAt?: string
  approvedByName?: string
  approvedByEmail?: string
  approvedByRole?: string
  approvedAt?: string
  arrivedAt?: string | null
  expiresAt?: string
  lastVisitAt?: string
}

export type User = {
  id: string
  email: string
  name?: string
  role: string
}

export type VisitBadgePdfOptions = {
  visit: VisitRecord
  qrCodeDataUrl: string
  typeLabels: Record<VisitType, string>
  language: string
  themeMode: 'light' | 'dark'
  currentUser: User | null
  t: (key: string, options?: { lng?: string; defaultValue?: string }) => string
}

export function generateVisitBadgePdf(options: VisitBadgePdfOptions) {
  const { visit, qrCodeDataUrl, typeLabels, language, themeMode, currentUser, t } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Theme-based colors
  const isDarkMode = themeMode === 'dark'
  const primaryColor = isDarkMode ? [30, 144, 255] : [13, 110, 253]
  const backgroundColor = isDarkMode ? [45, 45, 45] : [255, 255, 255]
  const textColor = isDarkMode ? [255, 255, 255] : [0, 0, 0]
  const secondaryTextColor = isDarkMode ? [200, 200, 200] : [100, 100, 100]
  const borderColor = isDarkMode ? [100, 100, 100] : [200, 200, 200]

  // Set background color for the entire page
  doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2])
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Helper function to draw a section box
  const drawSectionBox = (startY: number, endY: number, title: string) => {
    // Colored header rectangle
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(20, startY, pageWidth - 40, 10, 'F')

    // Section title
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(title, 23, startY + 7)

    // Box border
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    doc.setLineWidth(0.5)
    doc.rect(20, startY, pageWidth - 40, endY - startY, 'D')
  }

  // Header bar with title and badge info
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text(
    t('visitDetails.pdf.title', { lng: language, defaultValue: 'VISIT BADGE' }).toUpperCase(),
    pageWidth / 2,
    18,
    { align: 'center' },
  )

  yPosition = 38

  // Status badge in header - centered
  const statusColors: Record<string, [number, number, number]> = {
    approved: [40, 167, 69],
    pending: [255, 193, 7],
    denied: [220, 53, 69],
  }
  const statusColor = statusColors[visit.status] || [108, 117, 125]
  const statusText = visit.status.toUpperCase()
  const statusWidth = doc.getTextWidth(statusText) + 10

  // Center the badge
  const statusX = (pageWidth - statusWidth) / 2

  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  doc.roundedRect(statusX, 22, statusWidth, 7, 1.5, 1.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(statusText, statusX + statusWidth / 2, 26, { align: 'center' })

  // Visitor Information Section
  const visitorStartY = yPosition
  drawSectionBox(
    visitorStartY,
    visitorStartY + 35,
    t('visitDetails.pdf.visitorInformation', {
      lng: language,
      defaultValue: 'VISITOR INFORMATION',
    }).toUpperCase(),
  )
  yPosition = visitorStartY + 13

  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(t('visitDetails.pdf.name', { lng: language, defaultValue: 'Name' }) + ':', 25, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(visit.visitorName, 52, yPosition)
  yPosition += 7

  if (visit.visitorEmail) {
    doc.setFont('helvetica', 'bold')
    doc.text(
      t('visitDetails.pdf.email', { lng: language, defaultValue: 'Email' }) + ':',
      25,
      yPosition,
    )
    doc.setFont('helvetica', 'normal')
    doc.text(visit.visitorEmail, 52, yPosition)
    yPosition += 7
  }

  if (visit.vehiclePlate) {
    doc.setFont('helvetica', 'bold')
    doc.text(
      t('visitDetails.pdf.vehicle', { lng: language, defaultValue: 'Vehicle' }) + ':',
      25,
      yPosition,
    )
    doc.setFont('helvetica', 'normal')
    doc.text(visit.vehiclePlate, 52, yPosition)
    yPosition += 7
  }

  // Host Information Section
  const hostStartY = yPosition + 7
  drawSectionBox(
    hostStartY,
    hostStartY + 25,
    t('visitDetails.pdf.hostInformation', {
      lng: language,
      defaultValue: 'HOST INFORMATION',
    }).toUpperCase(),
  )
  yPosition = hostStartY + 16

  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.setFont('helvetica', 'bold')
  doc.text(
    t('visitDetails.pdf.hostName', { lng: language, defaultValue: 'Host Name' }) + ':',
    25,
    yPosition,
  )
  doc.setFont('helvetica', 'normal')
  doc.text(visit.hostName, 52, yPosition)
  yPosition += 7

  doc.setFont('helvetica', 'bold')
  doc.text(t('visitDetails.pdf.unit', { lng: language, defaultValue: 'Unit' }) + ':', 25, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(visit.hostUnit, 52, yPosition)

  // Visit Details Section - Two columns
  const detailsStartY = yPosition + 12
  drawSectionBox(
    detailsStartY,
    detailsStartY + 50,
    t('visitDetails.pdf.visitDetails', {
      lng: language,
      defaultValue: 'VISIT DETAILS',
    }).toUpperCase(),
  )
  yPosition = detailsStartY + 16

  doc.setTextColor(textColor[0], textColor[1], textColor[2])

  // Left column
  doc.setFont('helvetica', 'bold')
  doc.text(t('visitDetails.pdf.site', { lng: language, defaultValue: 'Site' }) + ':', 25, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(visit.siteName, 52, yPosition)
  yPosition += 7

  const scheduledDate = new Date(visit.scheduledFor)
  doc.setFont('helvetica', 'bold')
  doc.text(
    t('visitDetails.pdf.scheduled', { lng: language, defaultValue: 'Scheduled' }) + ':',
    25,
    yPosition,
  )
  doc.setFont('helvetica', 'normal')
  doc.text(scheduledDate.toLocaleString(language), 52, yPosition)
  yPosition += 7

  if (visit.expiresAt) {
    const expiresDate = new Date(visit.expiresAt)
    doc.setFont('helvetica', 'bold')
    doc.text(
      t('visitDetails.pdf.expires', { lng: language, defaultValue: 'Expires' }) + ':',
      25,
      yPosition,
    )
    doc.setFont('helvetica', 'normal')
    doc.text(expiresDate.toLocaleString(language), 52, yPosition)
  }

  // Right column
  yPosition = detailsStartY + 16
  const typeText =
    typeLabels[visit.type] || visit.type.charAt(0).toUpperCase() + visit.type.slice(1)
  doc.setFont('helvetica', 'bold')
  doc.text(
    t('visitDetails.pdf.type', { lng: language, defaultValue: 'Type' }) + ':',
    110,
    yPosition,
  )
  doc.setFont('helvetica', 'normal')
  doc.text(typeText, 120, yPosition)
  yPosition += 7

  doc.setFont('helvetica', 'bold')
  doc.text(
    t('visitDetails.pdf.badgeCode', { lng: language, defaultValue: 'Badge Code' }) + ':',
    110,
    yPosition,
  )

  // Badge code text (larger, monospace, and bold)
  yPosition += 12
  doc.setFontSize(18)
  doc.setFont('courier', 'bold')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text(visit.badgeCode, 110, yPosition)

  // Reset to normal
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPosition += 15

  if (visit.arrivedAt) {
    const arrivedDate = new Date(visit.arrivedAt)
    doc.setFont('helvetica', 'bold')
    doc.text(
      t('visitDetails.pdf.arrived', { lng: language, defaultValue: 'Arrived' }) + ':',
      110,
      yPosition,
    )
    doc.setFont('helvetica', 'normal')
    doc.text(arrivedDate.toLocaleString(language), 120, yPosition)
  }

  // QR Code Section with border
  const qrStartY = yPosition + 15
  drawSectionBox(
    qrStartY,
    qrStartY + 90,
    t('visitDetails.pdf.qrCode', { lng: language, defaultValue: 'BADGE QR CODE' }).toUpperCase(),
  )
  yPosition = qrStartY + 13

  // Add QR Code (centered)
  const qrSize = 50
  const qrX = (pageWidth - qrSize) / 2
  const qrY = yPosition + 5

  // White background for QR code
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, 'F')

  // QR code border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  doc.setLineWidth(1)
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, 'D')

  doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  yPosition = qrY + qrSize + 12
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2])
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text(
    t('visitDetails.pdf.qrInstructions', {
      lng: language,
      defaultValue: 'Scan this QR code to validate the badge',
    }),
    pageWidth / 2,
    yPosition,
    { align: 'center' },
  )

  // Footer
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2])
  doc.setFontSize(8)
  const footerY = pageHeight - 20
  const dateStr = new Date().toLocaleDateString(language)
  const timeStr = new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })
  doc.text(
    t('visitDetails.pdf.generatedOn', { lng: language, defaultValue: 'Generated on' }) +
      ` ${dateStr} at ${timeStr}`,
    pageWidth / 2,
    footerY,
    { align: 'center' },
  )

  if (currentUser) {
    const generatedBy =
      currentUser.name ||
      currentUser.email ||
      t('visitDetails.pdf.system', { lng: language, defaultValue: 'System' })
    doc.text(
      `${t('visitDetails.pdf.generatedBy', { lng: language, defaultValue: 'Generated by' })}: ${generatedBy}`,
      pageWidth / 2,
      footerY + 5,
      { align: 'center' },
    )
  }

  doc.setTextColor(
    secondaryTextColor[0] - 30,
    secondaryTextColor[1] - 30,
    secondaryTextColor[2] - 30,
  )
  doc.text(
    `${t('visitDetails.pdf.visitId', { lng: language, defaultValue: 'Visit ID' })}: ${visit.id}`,
    pageWidth / 2,
    footerY + 10,
    { align: 'center' },
  )

  // Save the PDF
  doc.save(`visit-badge-${visit.badgeCode}.pdf`)
}
