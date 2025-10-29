// src/features/Marketplace/components/CheckoutModal.js
import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';

import { useNavigation } from '@react-navigation/native'; // <<< IMPORT

// const placeholderImage = require('../../../assets/images/placeholder_image.png');

const CheckoutModal = ({ isVisible, onClose, itemData }) => {
  const navigation = useNavigation(); // <<< Dapatkan navigation
  // Ambil data produk (bisa dilempar dari ProductDetailScreen)
  const product = itemData || {
    title: 'Buku Sejarah',
    price: 100000,
    stock: 3,
    variants: ['Part 1', 'Part 2', 'part 3'],
    imageUrl: 'https://via.placeholder.com/150/EEEEEE/333?text=Buku',
  };

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const imageSource = product.imageUrl
    ? { uri: product.imageUrl }
    : require('../../../../src/assets/images/dummyImage.png'); // Sediakan placeholder

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    console.log(`Add to Cart: ${quantity} x ${selectedVariant}`);
    onClose(); // Tutup modal setelah aksi
  };

  const handleBuyNow = () => {
    console.log(`Buy Now: ${quantity} x ${selectedVariant}`);
    onClose(); // 1. Tutup modal
    // 2. Navigasi ke Checkout
    navigation.navigate('Checkout', {
      product: product,
      quantity: quantity,
      variant: selectedVariant,
      // Kirim data yang diperlukan ke CheckoutScreen
    });
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
        {/* Handle (opsional) */}
        <View style={styles.handle} />

        {/* Info Produk (Atas) */}
        <View style={styles.productHeader}>
          <Image source={imageSource} style={styles.thumbnail} />
          <View style={styles.headerText}>
            <Text style={styles.price}>
              Rp{product.price.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.stock}>Stock: Sisa {product.stock}</Text>
          </View>
        </View>

        {/* Varian */}
        <Text style={styles.label}>Varian</Text>
        <View style={styles.variantContainer}>
          {product.variants.map(variant => (
            <TouchableOpacity
              key={variant}
              style={[
                styles.variantButton,
                selectedVariant === variant
                  ? styles.variantButtonSelected
                  : styles.variantButtonDefault,
              ]}
              onPress={() => setSelectedVariant(variant)}
            >
              <Text
                style={[
                  styles.variantText,
                  selectedVariant === variant
                    ? styles.variantTextSelected
                    : styles.variantTextDefault,
                ]}
              >
                {variant}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Jumlah */}
        <View style={styles.quantityRow}>
          <Text style={styles.label}>Jumlah</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrement}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
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
          >
            <Text style={[styles.actionButtonText, styles.cartButtonText]}>
              Keranjang
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={handleBuyNow}
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
    width: 80, // Ukuran thumbnail di modal
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
    color: '#FF6B6B', // Merah (estimasi)
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
    flexWrap: 'wrap', // Agar bisa ke baris baru jika varian banyak
    marginBottom: 20,
  },
  variantButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10, // Jika wrap
  },
  variantButtonDefault: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  variantButtonSelected: {
    backgroundColor: '#E3D5B8',
    borderColor: '#E3D5B8',
  },
  variantText: { fontSize: 13 },
  variantTextDefault: { color: '#555' },
  variantTextSelected: { color: '#6A453C', fontWeight: 'bold' },
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
    marginBottom: 10, // Jarak ke bawah
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
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CheckoutModal;
