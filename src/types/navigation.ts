import { Product } from '../models/Product';

export type RootStackParamList = {
  Login: undefined;
  ProductList: undefined;
  AddEditProduct: { productToEdit?: Product };
};