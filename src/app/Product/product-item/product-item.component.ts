import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { shoppingCartService } from '../../ShoppingCartPage/shopping-cart.service';
import { MatDialog, PageEvent } from '@angular/material';
import { CommentDialogComponent } from '../../CustomDialogs/comment-dialog/comment-dialog.component';
import { CartDialogComponent } from '../../CustomDialogs/cart-dialog/cart-dialog.component';
import { authService } from '../../auth/auth.service';
import { ConfirmComponent } from '../../CustomDialogs/confirm-dialog/confirm.component';
import { Subscription } from 'rxjs';
import { ProductDetailModel } from '../../Interfaces/product-detail';
import { Router, Params } from '@angular/router';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public dialog: MatDialog,
    private authService: authService,
    private shoppingCartService: shoppingCartService,
    private router: Router) { }

  private productId: string;
  public comments: any[];
  public userId: string;
  private isAdmin: boolean;
  public notAuthorized = 'notauthenticated';


  private ProductSub: Subscription;
  private routeParamsSub: Subscription;
  private isAdminSub: Subscription;
  public productDetail: ProductDetailModel | any = {};
  public totalComments: number;

  // paginator variables
  private currentPage = 1;
  public pageSize = 2;
  public pageSizeOptions = [2, 5, 10];
  public pageIndex = 0;


  ngOnInit() {
    // check if the user is admin
    this.isAdminSub = this.authService.getAdminStatus().subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
    // subscribe to the params observable otherwise the data won't change on the same url pattern.
    this.routeParamsSub = this.route.params.subscribe((params: Params) => {
      this.productId = params.id;
      // check the authentication status
      this.userId = this.authService.getUserId();
      // getting the information from the Product
      this.productService.getTargetProduct(this.productId, this.pageSize, this.currentPage);
      this.ProductSub = this.productService.TargetProductSubListener().subscribe((data) => {
        this.productDetail = {
          name: data.data.name,
          type: data.data.type,
          description: data.data.description,
          price: data.data.price,
          comments: [],
          alsoLike: data.data.alsoLike,
          imageUrl: data.data.imageUrl,
          calory: data.data.calory,
          likes: data.data.likes,
          ingredients: data.data.ingredients
        }
        this.comments = data.comments;
        this.totalComments = data.maxComments;
        for (const date of this.comments) {
          date.createdAt = (date.createdAt as string).slice(0, 10);
        }
      });
    });
  }

  addComments() {
    this.openCommentDialog();
  }

  onDelete(id: string) {
    this.openDeleteDialog(id);
  }

  toProductPage(id: string) {
    this.router.navigate([`product/${id}`]);
  }

  changePage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.pageSize = pageData.pageSize;
    this.pageIndex = pageData.pageIndex;
    this.productService.getTargetProduct(this.productId, this.pageSize, this.currentPage);
  }

  // add to user shopping cart
  addToShoppingCart() {
    this.shoppingCartService.AddOnetoCart(this.userId, this.productId).subscribe(data => {
      const cartDialogRef = this.dialog.open(CartDialogComponent, {
        panelClass: 'my-class',
        data: { message: `已經此商品加入您的購物車 !` }
      });

      cartDialogRef.afterClosed().subscribe(value => {
        if (value === 'tocart') {
          this.router.navigate([`cart/${this.userId}`]);
        }
        if (value === 'stay') {
          this.router.navigate([`product/${this.productId}`])
        }
      });
    })
  }

  openCommentDialog(): void {
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe((UserComment) => {
      if (UserComment) {
        const userId = this.authService.getUserId();
        this.productService.addComment(this.productId, userId, UserComment).subscribe(data => {
          this.totalComments = this.totalComments + 1;
          const lastPageIndex = Math.ceil(this.totalComments / this.pageSize) - 1;
          this.pageIndex = lastPageIndex;
          this.productService.getTargetProduct(this.productId, this.pageSize, lastPageIndex + 1);
        })
      }
    })
  }

  openDeleteDialog(id: string) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '300px',
      data: { message: `確定要將留言刪除嗎?` }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === true) {
        this.productService.deleteComment(id).subscribe((data) => {
          // we have to take the data exactly where the pageIndex correspond.
          this.pageIndex = 0;
          this.totalComments = this.totalComments - 1;
          this.productService.getTargetProduct(this.productId, this.pageSize, 1);
        })
      }
    })
  }

  ngOnDestroy() {
    this.ProductSub.unsubscribe();
    this.routeParamsSub.unsubscribe();
    this.isAdminSub.unsubscribe();
  }
}

