let cart = [];
let modalQt = 1;
let modalKey = 0;

const c = (el) => document.querySelector(el);
const cs = (el) => document.querySelectorAll(el);

// Preencher as informações das pizzas e configurar eventos
pizzaJson.map((item, index) => {
    let pizzaItem = c('.models .pizza-item').cloneNode(true);

    pizzaItem.setAttribute('data-key', index);
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price.toFixed(2)}`;
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;

    pizzaItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        let key = e.target.closest('.pizza-item').getAttribute('data-key');
        modalQt = 1;
        modalKey = key;

        c('.pizzaBig img').src = pizzaJson[key].img;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`;
        c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
        c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
        c('.pizzaInfo--size.selected').classList.remove('selected');
        cs('.pizzaInfo--size').forEach((size, sizeIndex) => {
            if (sizeIndex === 2) {
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
        });

        c('.pizzaInfo--qt').innerHTML = modalQt;

        c('.pizzaWindowArea').style.opacity = 0;
        c('.pizzaWindowArea').style.display = 'flex';
        setTimeout(() => {
            c('.pizzaWindowArea').style.opacity = 1;
        }, 200);
    });

    c('.pizza-area').append(pizzaItem);
});

// Função para fechar o modal
function closeModal() {
    c('.pizzaWindowArea').style.opacity = 0;
    setTimeout(() => {
        c('.pizzaWindowArea').style.display = 'none';
    }, 500);
}
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item) => {
    item.addEventListener('click', closeModal);
});

// Botão de quantidade
c('.pizzaInfo--qtmenos').addEventListener('click', () => {
    if (modalQt > 1) {
        modalQt--;
        c('.pizzaInfo--qt').innerHTML = modalQt;
    }
});
c('.pizzaInfo--qtmais').addEventListener('click', () => {
    modalQt++;
    c('.pizzaInfo--qt').innerHTML = modalQt;
});

// Botão de tamanho
cs('.pizzaInfo--size').forEach((size) => {
    size.addEventListener('click', () => {
        c('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
    });
});

// Adicionando ao carrinho
c('.pizzaInfo--addButton').addEventListener('click', () => {
    let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));
    let identifier = pizzaJson[modalKey].id + '@' + size;
    let key = cart.findIndex((item) => item.identifier == identifier);
    if (key > -1) {
        cart[key].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id: pizzaJson[modalKey].id,
            size,
            qt: modalQt
        });
    }
    updateCart();
    closeModal();
});

// Função para atualizar o carrinho
function updateCart() {
    if (cart.length > 0) {
        c('aside').classList.add('show');
        c('.cart').innerHTML = '';

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        for (let i in cart) {
            let pizzaItem = pizzaJson.find((item) => item.id == cart[i].id);
            subtotal += pizzaItem.price * cart[i].qt;

            let cartItem = c('.models .cart--item').cloneNode(true);

            let pizzaSizeName;
            switch (cart[i].size) {
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2:
                    pizzaSizeName = 'G';
                    break;
            }

            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                if (cart[i].qt > 1) {
                    cart[i].qt--;
                } else {
                    cart.splice(i, 1);
                }
                updateCart();
            });
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                cart[i].qt++;
                updateCart();
            });

            c('.cart').append(cartItem);
        }

        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        c('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
        c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
        c('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;
    } else {
        c('aside').classList.remove('show');
    }
}

// Modal de pagamento

document.addEventListener('DOMContentLoaded', () => {
    const finalizarCompraBtn = document.querySelector('.cart--finalizar');
    const modal = document.getElementById('paymentModal');
    const closeButton = document.querySelector('.close-button');

    finalizarCompraBtn.addEventListener('click', () => {
        showPaymentModal();
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function showPaymentModal() {
        let paymentModal = document.createElement('div');
        paymentModal.className = 'payment-modal';
        paymentModal.innerHTML = `
            <div class="payment-modal-content">
                <span class="close-button">&times;</span>
                <h2>Forma de Pagamento</h2>
                <p>Escolha a forma de pagamento:</p>
                <button class="payment-button" data-payment="credit-card">Cartão de Crédito/Débito</button>
                <button class="payment-button" data-payment="pix">Pix</button>
                <button class="payment-button" data-payment="cash">Dinheiro</button>
                <div class="credit-card-form" style="display: none;">
                    <h3>Dados do Cartão de Crédito</h3>
                    <label for="cardNumber">Número do Cartão</label>
                    <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" />
                    <label for="cardName">Nome no Cartão</label>
                    <input type="text" id="cardName" placeholder="Nome Completo" />
                    <label for="expiryDate">Data de Expiração</label>
                    <input type="text" id="expiryDate" placeholder="MM/AA" />
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="123" />
                    <button class="confirm-payment">Confirmar Pagamento</button>
                </div>
                <div class="payment-details" style="display: none;">
                    <!-- Aqui será exibido o QR code ou a pergunta sobre troco -->
                </div>
            </div>
        `;

        document.body.appendChild(paymentModal);

        // Adiciona eventos para fechar o modal
        paymentModal.querySelector('.close-button').addEventListener('click', () => {
            paymentModal.remove();
        });

        // Adiciona eventos para os botões de pagamento
        paymentModal.querySelectorAll('.payment-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const paymentMethod = e.target.getAttribute('data-payment');
                const creditCardForm = paymentModal.querySelector('.credit-card-form');
                const paymentDetails = paymentModal.querySelector('.payment-details');

                if (paymentMethod === 'credit-card') {
                    creditCardForm.style.display = 'block';
                    paymentDetails.style.display = 'none';
                } else {
                    creditCardForm.style.display = 'none';
                    paymentDetails.style.display = 'block';

                    if (paymentMethod === 'cash') {
                        paymentDetails.innerHTML = `
                            <h3>Dinheiro</h3>
                            <label for="needChange">Precisa de troco?</label>
                            <select id="needChange">
                                <option value="no">Não</option>
                                <option value="yes">Sim</option>
                            </select>
                            <div id="changeAmount" style="display: none;">
                                <label for="amount">Quantidade de Troco</label>
                                <input type="text" id="amount" placeholder="R$ 0,00" />
                            </div>
                            <button class="confirm-payment">Confirmar Pagamento</button>
                        `;

                        document.getElementById('needChange').addEventListener('change', (event) => {
                            const value = event.target.value;
                            const changeAmountDiv = document.getElementById('changeAmount');
                            if (value === 'yes') {
                                changeAmountDiv.style.display = 'block';
                            } else {
                                changeAmountDiv.style.display = 'none';
                            }
                        });
                    } else if (paymentMethod === 'pix') {
                        paymentDetails.innerHTML = `
                            <h3>Pix</h3>
                            <p>Aqui está o QR Code para o pagamento:</p>
                            <div id="pixQRCode"></div>
                        `;
                        generatePixQRCode();
                    }
                }
            });
        });

        // Evento para confirmar o pagamento com cartão
        paymentModal.querySelector('.confirm-payment').addEventListener('click', () => {
            const cardNumber = paymentModal.querySelector('#cardNumber').value;
            const cardName = paymentModal.querySelector('#cardName').value;
            const expiryDate = paymentModal.querySelector('#expiryDate').value;
            const cvv = paymentModal.querySelector('#cvv').value;

            if (cardNumber && cardName && expiryDate && cvv) {
                alert('Pagamento com cartão de crédito processado com sucesso!');
                paymentModal.remove();
            } else {
                alert('Por favor, preencha todos os dados do cartão.');
            }
        });
    }

    function generatePixQRCode() {
        // Aqui você pode usar uma biblioteca para gerar QR Code ou uma API para isso
        // Exemplo com uma API pública (pode ser substituído por uma biblioteca específica)
        const pixQRCode = document.getElementById('pixQRCode');
        const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PIX%20CODE%20HERE'; // Substitua com o código Pix real
        pixQRCode.innerHTML = `<img src="${qrCodeUrl}" alt="QR Code"/>`;
    }
});

function generatePixQRCode() {
    const pixQRCode = document.getElementById('pixQRCode');
    pixQRCode.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${Math.random()}" alt="QR Code">`;
}

function askForChange() {
    const cashForm = document.querySelector('.cash-form');
    const changeAmount = document.getElementById('changeAmount');
    cashForm.style.display = 'block';
    changeAmount.style.display = 'block';
}
