const fs = require('fs');


class ProductManager {
    constructor(path) {
        this.path = path;
        if (fs.existsSync(path) == false) {
            fs.writeFileSync(path, JSON.stringify([]));
        };
    }
    static getNewId(lastProduct) {
        if (!lastProduct) {
            return 1;
        } else {
            return lastProduct.id + 1;
        }
    }
    async getProducts() {
        let products = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(products);
    }
    async addProduct(title, description, price, thumbnail, code, stock) {
        let products = await this.getProducts();
        let codes = products.map(p => p.code)

        if (codes.includes(code)) {
            console.log('Este producto ya existe');
            return;
        }
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error('Por favor complete los campos obligatorios');
            return
        }
        let lastProduct = products[products.length - 1]
        let newId = ProductManager.getNewId(lastProduct);
        products.push({ title: title, description: description, price: price, thumbnail: thumbnail, code: code, stock: stock, id: newId });
        fs.writeFileSync(this.path, JSON.stringify(products));
    }

    async getProductById(id) {
        let products = await this.getProducts();
        let product = products.find(p => p.id === id);
        if (product) {
            return product;
        }
        console.error('No existe el producto');
    }
    async updateProduct(id, updatedProduct) {
        let products = await this.getProducts();
        let productIndex = products.findIndex(p => p.id == id);
        products[productIndex] = { ...products[productIndex], ...updatedProduct };
        await fs.promises.writeFile(this.path, JSON.stringify(products));
    }
    async deleteProduct(id) {
        let products = await this.getProducts();
        let productIndex = products.findIndex(p => p.id == id);
        products.splice(productIndex, 1);
        await fs.promises.writeFile(this.path, JSON.stringify(products));
    }
}
//testing 

(async function main() {
    try {
        const productManager = new ProductManager('./productos.txt');
        
        //productos para el testing del método addProduct
        await productManager.addProduct('titulo1', 'descripcion titulo1', 20, 'foto', '1', 12);
        await productManager.addProduct('titulo2', 'descripcion titulo2', 30, 'foto2', '2', 40);
        await productManager.addProduct('titulo3', 'descripcion titulo3', 15, 'foto3', '3', 30);
        await productManager.addProduct('titulo4', 'descripcion titulo4', 45, 'foto4', '4', 10);
       
       //productos de prueba con un mismo código
        await productManager.addProduct('producto prueba', 'descripcion producto prueba', 130, 'foto5', '11', 5);
        await productManager.addProduct('producto prueba', 'descripcion producto prueba', 50, 'foto6', '11', 5);
        
        //getProducts
        let resultProducts = await productManager.getProducts();
        console.log(resultProducts);
        
        //getProductsById
        console.log(await productManager.getProductById(1));
        productManager.getProductById(5);

        //updateProduct
        await productManager.updateProduct(2, { price: 20 });
        console.log(await productManager.getProductById(2));
        
        //deleteProduct
        await productManager.deleteProduct(1)
        console.log(await productManager.getProducts());
    } catch (err) {
        console.error(err);
    }
})();