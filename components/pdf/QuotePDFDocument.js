import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logoText: { fontSize: 18, fontWeight: 700, color: '#131B22' },
  meta: { fontSize: 9, color: '#666', marginBottom: 2 },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  table: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#F4F6F7', paddingVertical: 8, fontWeight: 700 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, alignItems: 'center' },
  colImage: { width: 50 },
  colName: { flex: 1, paddingHorizontal: 6 },
  colQty: { width: 40, textAlign: 'center' },
  colPrice: { width: 70, textAlign: 'right' },
  colDiscount: { width: 45, textAlign: 'right' },
  colTotal: { width: 70, textAlign: 'right' },
  image: { width: 40, height: 40, objectFit: 'cover', borderRadius: 4 },
  summary: { marginTop: 16, alignSelf: 'flex-end', width: 220 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#333', marginTop: 4 },
  note: { marginTop: 20, fontSize: 9, color: '#555', backgroundColor: '#F4F6F7', padding: 10, borderRadius: 4 },
  footer: { position: 'absolute', bottom: 24, left: 32, right: 32, fontSize: 8, color: '#999', textAlign: 'center' },
});

export default function QuotePDFDocument({ quotation }) {
  const subtotal = quotation.items.reduce((sum, item) => sum + item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100), 0);
  const shipping = quotation.shippingCharge || 0;
  const grandTotal = subtotal + shipping;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Suma Automation</Text>
            <Text style={styles.meta}>sumaautomation.lk</Text>
          </View>
          <View>
            <Text style={styles.title}>Quotation</Text>
            <Text style={styles.meta}>{quotation.quotationNumber}</Text>
            <Text style={styles.meta}>{new Date(quotation.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>

        <Text style={styles.meta}>Prepared for: {quotation.user?.name}</Text>
        <Text style={styles.meta}>Email: {quotation.user?.email}</Text>
        <Text style={styles.meta}>Phone: {quotation.contactPhone}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colImage}></Text>
            <Text style={styles.colName}>Product</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colDiscount}>Disc.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {quotation.items.map((item, i) => {
            const lineTotal = item.qty * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
            return (
              <View style={styles.tableRow} key={i}>
                <View style={styles.colImage}>
                  {item.product?.images?.[0] && <Image src={item.product.images[0]} style={styles.image} />}
                </View>
                <Text style={styles.colName}>{item.name}</Text>
                <Text style={styles.colQty}>{item.qty}</Text>
                <Text style={styles.colPrice}>Rs. {item.unitPrice.toLocaleString()}</Text>
                <Text style={styles.colDiscount}>{item.discountPercent ? `${item.discountPercent}%` : '-'}</Text>
                <Text style={styles.colTotal}>Rs. {lineTotal.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text>Subtotal</Text><Text>Rs. {subtotal.toLocaleString()}</Text></View>
          <View style={styles.summaryRow}><Text>Shipping / Delivery</Text><Text>Rs. {shipping.toLocaleString()}</Text></View>
          <View style={styles.summaryTotal}>
            <Text style={{ fontWeight: 700 }}>Grand Total</Text>
            <Text style={{ fontWeight: 700 }}>Rs. {grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {quotation.adminNote && (
          <View style={styles.note}><Text>{quotation.adminNote}</Text></View>
        )}

        <Text style={styles.footer}>Suma Automation — sumaautomation.lk — Valid for 14 days from issue date.</Text>
      </Page>
    </Document>
  );
}