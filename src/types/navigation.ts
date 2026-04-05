
import { Product } from '../models/Product';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ProductList: undefined;
  AddEditProduct: { productToEdit?: Product };
};
