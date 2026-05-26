import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  companyName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },
  companyInfo: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#64748B",
    letterSpacing: 1,
    marginBottom: 6,
  },
  clientInfo: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: "8 10",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 10",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  colHeader: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#64748B",
    textTransform: "uppercase",
  },
  total: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  totalBox: {
    width: 180,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "5 0",
  },
  totalLabel: {
    fontSize: 10,
    color: "#64748B",
  },
  totalAmount: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },
  statusBadge: {
    padding: "3 8",
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#94A3B8",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
};

interface InvoicePDFProps {
  invoice: {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    customerName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
    customerAddress: string | null;
    serviceName: string | null;
    serviceDescription: string | null;
    scheduledAt: Date | null;
  };
  tenantName: string;
  tenantPhone?: string | null;
}

export function InvoicePDF({ invoice, tenantName, tenantPhone }: InvoicePDFProps) {
  const invoiceNumber = `FAC-${invoice.id.substring(0, 8).toUpperCase()}`;
  const dateStr = new Date(invoice.createdAt).toLocaleDateString("fr-FR");
  const scheduledStr = invoice.scheduledAt
    ? new Date(invoice.scheduledAt).toLocaleDateString("fr-FR")
    : null;
  const amountFormatted = new Intl.NumberFormat("fr-FR").format(invoice.amount) + " FCFA";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{tenantName}</Text>
            {tenantPhone && <Text style={styles.companyInfo}>{tenantPhone}</Text>}
            <Text style={styles.companyInfo}>Gabon</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>Date : {dateStr}</Text>
            <Text
              style={[
                styles.invoiceNumber,
                {
                  color:
                    invoice.status === "paid"
                      ? "#10B981"
                      : invoice.status === "sent"
                      ? "#F59E0B"
                      : "#64748B",
                  fontFamily: "Helvetica-Bold",
                },
              ]}
            >
              Statut : {STATUS_LABELS[invoice.status] ?? invoice.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à</Text>
          <Text style={styles.clientInfo}>{invoice.customerName ?? "Client"}</Text>
          {invoice.customerPhone && (
            <Text style={styles.clientInfo}>{invoice.customerPhone}</Text>
          )}
          {invoice.customerEmail && (
            <Text style={styles.clientInfo}>{invoice.customerEmail}</Text>
          )}
          {invoice.customerAddress && (
            <Text style={styles.clientInfo}>{invoice.customerAddress}</Text>
          )}
        </View>

        {/* Tableau des prestations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestations</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.colHeader]}>Description</Text>
            <Text style={[styles.col2, styles.colHeader]}>Montant</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text>{invoice.serviceName ?? "Prestation de service"}</Text>
              {invoice.serviceDescription && (
                <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>
                  {invoice.serviceDescription}
                </Text>
              )}
              {scheduledStr && (
                <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>
                  Date d'intervention : {scheduledStr}
                </Text>
              )}
            </View>
            <Text style={styles.col2}>{amountFormatted}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalBox}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.totalAmount}>{amountFormatted}</Text>
            </View>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Document généré par SmartService — smartservice.ga
        </Text>
      </Page>
    </Document>
  );
}
