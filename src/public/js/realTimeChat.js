document.addEventListener('DOMContentLoaded', () => {
  // Se ejecuta cuando el contenido del DOM ha sido completamente cargado

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('user');
  const messageInput = document.getElementById('message');
  const btnGoToIndex = document.getElementById('btnGoToIndex');

  // Selecciona elementos del DOM para su manipulación

  const socket = io();

  // Establece la conexión del cliente al servidor a través de Socket.IO

  // Manejar mensajes existentes al conectarse
  socket.on('chats', (chats) => {
    // Maneja mensajes existentes al conectarse al servidor
    chats.forEach((chat) => {
      addChatToChatList(chat);
    });
  });

  // Manejar nuevo mensaje del chat
  socket.on('chat', (newChat) => {
    // Maneja un nuevo mensaje del chat enviado desde el servidor
    addChatToChatList(newChat);
  });

  chatForm.addEventListener('submit', async (e) => {
    // Se ejecuta cuando se envía el formulario

    e.preventDefault();
    const user = userInput.value;
    const message = messageInput.value;

    // Recolecta los valores del formulario

    if (user && message) {
      // Verifica que tanto el usuario como el mensaje tengan contenido

      // Enviar nuevo mensaje al servidor a través de Socket.IO
      socket.emit('chatMessage', { user, message });

      // Emite un evento 'chatMessage' al servidor con los datos del formulario

      // Limpiar campos después de enviar el mensaje
      userInput.value = '';
      messageInput.value = '';

      // Limpia los campos del formulario
    } else {
      // Puedes agregar una lógica adicional aquí, por ejemplo, mostrar un mensaje de error si el usuario o el mensaje están vacíos.
    }
  });

  btnGoToIndex.addEventListener('click', () => {
    // Se ejecuta cuando se hace clic en el botón 'btnGoToIndex'

    // Lógica para redirigir a la página de Index
    window.location.href = '/'; // Cambia esto según la lógica de redirección que necesites
  });

  function addChatToChatList(chat) {
    // Función para agregar un nuevo mensaje a la lista de mensajes en la interfaz de usuario

    const chatElement = document.createElement('p');
    chatElement.textContent = `${chat.user}: ${chat.message}`;
    chatMessages.appendChild(chatElement);

    // Crea un nuevo elemento de párrafo con el contenido del mensaje y lo agrega a la lista de mensajes en la interfaz de usuario
  }
});
