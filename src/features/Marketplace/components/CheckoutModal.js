// src/features/Marketplace/components/CheckoutModal.js
import React, { useState, useEffect } from 'react'; // <<< 1. Tambah useEffect
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';

// <<< 2. Terima 'selectedVariant' dari props
const CheckoutModal = ({ isVisible, onClose, itemData, selectedVariant }) => {
  const navigation = useNavigation();

  // <<< 3. Gunakan itemData langsung (asumsi sudah divalidasi di parent)
  const product = itemData;

  // <<< 4. State HANYA untuk quantity
  const [quantity, setQuantity] = useState(1);

  // Reset quantity ke 1 setiap kali modal dibuka
  useEffect(() => {
    if (isVisible) {
      setQuantity(1);
    }
  }, [isVisible]);

  // --- Safety Check ---
  // Jika 'product' (itemData) null, jangan render apa-apa
  if (!product) {
    return (
      <Modal isVisible={isVisible} style={styles.modal}>
        <View style={styles.contentContainer} />
      </Modal>
    );
  }
  // --- Akhir Safety Check ---

  // <<< 5. Ambil data dengan aman (gunakan fallback)
  const imageSource = product.image_url
    ? { uri: product.image_url }
    : require('../../../../src/assets/images/dummyImage.png');

  const price = product.price || 0;
  const stock = product.stock || 0;

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    console.log(`Add to Cart: ${quantity} x ${selectedVariant || 'Default'}`);
    onClose();
  };

  const handleBuyNow = () => {
    console.log(`Buy Now: ${quantity} x ${selectedVariant || 'Default'}`);
    onClose();
    navigation.navigate('Checkout', {
      product: product,
      quantity: quantity,
      variant: selectedVariant, // <<< Kirim varian yang dipilih dari parent
    });
  };

  // <<< 6. Fungsi baru untuk render varian (yang jauh lebih aman)
  const renderVariantInfo = () => {
    // Jika ada varian yang dipilih dari parent, tampilkan itu
    if (selectedVariant) {
      return (
        <>
          <Text style={styles.label}>Varian Dipilih</Text>
          <View style={styles.variantContainer}>
            <View style={[styles.variantButton, styles.variantButtonSelected]}>
              <Text style={[styles.variantText, styles.variantTextSelected]}>
                {selectedVariant}
              </Text>
            </View>
          </View>
        </>
      );
    }

    // Jika produk tidak punya varian (variants: null)
    // atau jika varian adalah object kosong
    if (
      !product.variants ||
      (typeof product.variants === 'object' &&
        !Array.isArray(product.variants) &&
        Object.keys(product.variants).length === 0)
    ) {
      return (
        <>
          <Text style={styles.label}>Varian</Text>
          <Text style={styles.defaultVariantText}>
            Produk ini tidak memiliki varian.
          </Text>
        </>
      );
    }

    // Jika ada varian TAPI user belum memilih (misal produk baru dibuka)
    return (
      <>
        <Text style={styles.label}>Varian</Text>
        <Text style={styles.defaultVariantText}>
          Harap pilih varian di halaman detail.
        </Text>
      </>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
    >
      {/* Konten Modal */}
      <View style={styles.contentContainer}>
        <View style={styles.handle} />

        {/* Info Produk (Atas) */}
        <View style={styles.productHeader}>
          <Image source={imageSource} style={styles.thumbnail} />
          <View style={styles.headerText}>
            <Text style={styles.price}>Rp{price.toLocaleString('id-ID')}</Text>
            <Text style={styles.stock}>
              {stock > 0 ? `Stock: Sisa ${stock}` : 'Stock Habis'}
            </Text>
          </View>
        </View>

        {/* Varian */}
        {/* <<< 7. Panggil fungsi render baru. INI YANG MENGHAPUS .map() >>> */}
        {renderVariantInfo()}

        {/* Jumlah */}
        <View style={styles.quantityRow}>
          <Text style={styles.label}>Jumlah</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrement}
              disabled={quantity === 1} // <<< Tambah disable
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
              disabled={quantity >= stock || stock === 0} // <<< Tambah disable
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Aksi (Keranjang & Beli) */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cartButton]}
            onPress={handleAddToCart}
            disabled={stock === 0} // <<< Disable jika stock habis
          >
            <Text style={[styles.actionButtonText, styles.cartButtonText]}>
              Keranjang
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.buyButton,
              stock === 0 && styles.disabledBuyButton, // <<< Style disable
            ]}
            onPress={handleBuyNow}
            disabled={stock === 0} // <<< Disable jika stock habis
          >
            <Text style={[styles.actionButtonText, styles.buyButtonText]}>
              Beli Sekarang
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES (Dengan tambahan style baru) ---
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 22,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    marginRight: 15,
  },
  headerText: {
    // flex: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  stock: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  variantContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  variantButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  variantButtonSelected: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  variantText: { fontSize: 13 },
  variantTextSelected: { color: '#6A453C', fontWeight: 'bold' },
  defaultVariantText: {
    // <<< Style baru
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
  },
  quantityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EEE',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E3D5B8',
  },
  cartButtonText: {
    color: '#6A453C',
  },
  buyButton: {
    backgroundColor: '#C8A870',
  },
  buyButtonText: {
    color: '#FFFFFF',
  },
  disabledBuyButton: {
    // <<< Style baru
    backgroundColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutModal;
