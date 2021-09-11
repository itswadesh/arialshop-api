import AdminDirective from './admin'
import AuthDirective from './auth'
import DemoDirective from './demo'
import GuestDirective from './guest'
import ManagerDirective from './manager'
import VendorDirective from './vendor'
import StoreDirective from './store'
//brand microDirective
import brandQueryDirective from './microDirectives/brand/brandQuery'
import brandSaveDirective from './microDirectives/brand/brandSave'
import brandDeleteDirective from './microDirectives/brand/brandDelete'
//category microDirective
import categoryQueryDirective from './microDirectives/category/categoryQuery'
import categorySaveDirective from './microDirectives/category/categorySave'
import categoryDeleteDirective from './microDirectives/category/categoryDelete'
//size microDirective
import sizeQueryDirective from './microDirectives/size/sizeQuery'
import sizeSaveDirective from './microDirectives/size/sizeSave'
import sizeDeleteDirective from './microDirectives/size/sizeDelete'

export default {
  admin: AdminDirective,
  auth: AuthDirective,
  demo: DemoDirective,
  guest: GuestDirective,
  manager: ManagerDirective,
  vendor: VendorDirective,
  store: StoreDirective,
  //brand microDirective
  brandQuery: brandQueryDirective,
  brandSave: brandSaveDirective,
  brandDelete: brandDeleteDirective,
  //category microDirective
  categoryQuery: categoryQueryDirective,
  categorySave: categorySaveDirective,
  categoryDelete: categoryDeleteDirective,
  //size microDirective
  sizeQuery: sizeQueryDirective,
  sizeSave: sizeSaveDirective,
  sizeDelete: sizeDeleteDirective,
}
