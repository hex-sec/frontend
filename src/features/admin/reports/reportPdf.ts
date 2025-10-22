import { jsPDF } from 'jspdf'
import { formatCurrency, type ReportSnapshot } from './reportData'

const MARGIN_X = 48
const LINE_HEIGHT = 18

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'report'

export type ReportPdfLabels = {
  reportTitle: string
  focusPrefix: string
  sitePrefix: string
  siteFallback: string
  dateRangePrefix: string
  generatedPrefix: string
  billingSummaryTitle: string
  eventHighlightsTitle: string
  keyNotesTitle: string
}

export function generateReportPdf(snapshot: ReportSnapshot, labels: ReportPdfLabels) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const innerWidth = pageWidth - MARGIN_X * 2
  let cursorY = 72

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(`${labels.reportTitle} — ${snapshot.title}`, MARGIN_X, cursorY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  cursorY += LINE_HEIGHT
  doc.text(`${labels.focusPrefix} ${snapshot.focus}`, MARGIN_X, cursorY)

  cursorY += LINE_HEIGHT
  doc.text(`${labels.sitePrefix} ${snapshot.siteName ?? labels.siteFallback}`, MARGIN_X, cursorY)

  cursorY += LINE_HEIGHT
  doc.text(`${labels.dateRangePrefix} ${snapshot.dateRange}`, MARGIN_X, cursorY)

  cursorY += LINE_HEIGHT
  doc.text(`${labels.generatedPrefix} ${snapshot.generatedAt}`, MARGIN_X, cursorY)

  cursorY += LINE_HEIGHT * 1.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(labels.billingSummaryTitle, MARGIN_X, cursorY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  cursorY += LINE_HEIGHT

  snapshot.billingSummary.forEach((row) => {
    doc.text(row.label, MARGIN_X, cursorY)
    doc.text(formatCurrency(row.amount), MARGIN_X + innerWidth, cursorY, { align: 'right' })

    if (row.trend) {
      doc.setTextColor(105)
      doc.setFontSize(10)
      cursorY += LINE_HEIGHT - 4
      doc.text(row.trend, MARGIN_X, cursorY)
      doc.setFontSize(12)
      doc.setTextColor(0)
    }

    cursorY += LINE_HEIGHT
  })

  cursorY += LINE_HEIGHT / 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(labels.eventHighlightsTitle, MARGIN_X, cursorY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  cursorY += LINE_HEIGHT

  snapshot.eventHighlights.forEach((event) => {
    doc.text(`• ${event.label}`, MARGIN_X, cursorY)
    doc.text(event.timeframe, MARGIN_X + innerWidth, cursorY, { align: 'right' })
    doc.setFontSize(10)
    doc.setTextColor(105)
    cursorY += LINE_HEIGHT - 4
    doc.text(event.impact, MARGIN_X + 16, cursorY, {
      maxWidth: innerWidth - 16,
    })
    doc.setFontSize(12)
    doc.setTextColor(0)
    cursorY += LINE_HEIGHT + 4
  })

  if (snapshot.insights.length) {
    cursorY += LINE_HEIGHT / 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(labels.keyNotesTitle, MARGIN_X, cursorY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    cursorY += LINE_HEIGHT

    snapshot.insights.forEach((note, index) => {
      doc.text(`${index + 1}. ${note}`, MARGIN_X, cursorY, { maxWidth: innerWidth })
      cursorY += LINE_HEIGHT
    })
  }

  const siteFragment = snapshot.siteName ? `${sanitizeFileName(snapshot.siteName)}-` : ''
  const dateFragment = snapshot.generatedOn.toISOString().slice(0, 10)
  const fileName = `hex-${snapshot.id}-${siteFragment}${sanitizeFileName(dateFragment)}.pdf`

  doc.save(fileName)
}
