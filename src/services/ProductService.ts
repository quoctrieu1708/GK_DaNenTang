import { collection, deleteDoc, doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../models/Product';
import { Platform } from 'react-native';

class ProductService {
  private collectionName = "products";
  private imgbbApiKey = 'a3b947794dc8b35fb16eec5aef9f343f'; // Lấy từ api.imgbb.com

  public async uploadImage(imageUri: string): Promise<string> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const res = await fetch(imageUri);
      const blob = await res.blob();
      formData.append('image', blob, 'product_image.jpg');
    } else {
      formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'product_image.jpg' } as any);
    }

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${this.imgbbApiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) return data.data.url;
      throw new Error(data.error.message);
    } catch (error: any) {
      throw new Error('Lỗi up ảnh: ' + error.message);
    }
  }

  public subscribeToProducts(onDataUpdated: (products: Product[]) => void) {
    return onSnapshot(collection(db, this.collectionName), (snapshot) => {
      const productList = snapshot.docs.map(doc => doc.data() as Product);
      onDataUpdated(productList);
    });
  }

  public async addProduct(tensp: string, loaisp: string, gia: number, hinhanh: string): Promise<void> {
    // Tự tạo idsanpham bằng thời gian hiện tại để đảm bảo duy nhất
    const idsanpham = Date.now().toString(); 
    const productRef = doc(db, this.collectionName, idsanpham);
    await setDoc(productRef, { idsanpham, tensp, loaisp, gia, hinhanh });
  }

  public async updateProduct(idsanpham: string, tensp: string, loaisp: string, gia: number, hinhanh: string): Promise<void> {
    const productRef = doc(db, this.collectionName, idsanpham);
    await updateDoc(productRef, { tensp, loaisp, gia, hinhanh });
  }

  public async deleteProduct(idsanpham: string): Promise<void> {
    const productRef = doc(db, this.collectionName, idsanpham);
    await deleteDoc(productRef);
  }
}

export const productService = new ProductService();