export default class ProductDTO {
    constructor(product) {
        this.title = product.title.trim();
        this.description = product.description?.trim() || 'Sin descripción';
        this.code = product.code.trim();
        this.price = product.price;
        this.status = typeof product.status === 'boolean' ? product.status : product.status === 'true' ? true : false;
        this.stock = product.stock ? (isNaN(product.stock) || product.stock < 0 ? 1 : parseInt(product.stock)) : 0;
        this.category = product.category?.trim() || 'Otros';
        this.thumbnails = Array.isArray(product.thumbnails) ? product.thumbnails : (product.thumbnails ? product.thumbnails.split(',').map(thumbnail => thumbnail.trim()) : []);
    }
}