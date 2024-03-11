const fs = require('fs').promises;

class CardManager {
  constructor(filePath) {
    this.path = filePath;
    this.cards = [];
    this.nextCardId = 1;

    // Cargar carritos desde el archivo al instanciar la clase
    this.loadCards();
  }

  async createCard() {
    const newCard = {
      id: this.nextCardId++,
      products: []
    };

    this.cards.push(newCard);
    await this.saveCards();
    return newCard;
  }

  async getCardById(id) {
    const card = this.cards.find((card) => card.id === id);
    return card || null;
  }

  async addProductToCard(cardId, productId, quantity) {
    const card = this.cards.find((card) => card.id === cardId);

    if (!card) {
      return null;
    }

    const existingProduct = card.products.find((product) => product.id === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      card.products.push({ id: productId, quantity });
    }

    await this.saveCards();
    return card;
  }

  async loadCards() {
    try {
      const data = await fs.readFile(this.path, 'utf8');
      this.cards = JSON.parse(data);
      this.nextCardId = Math.max(...this.cards.map((card) => card.id), 0) + 1;
    } catch (error) {
      console.warn("No se pudo cargar el archivo de carritos:", error.message);
    }
  }

  async saveCards() {
    try {
      const data = JSON.stringify(this.cards, null, 2);
      await fs.writeFile(this.path, data, 'utf8');
    } catch (error) {
      console.error("Error al guardar el archivo de carritos:", error.message);
    }
  }
}

module.exports = CardManager;




