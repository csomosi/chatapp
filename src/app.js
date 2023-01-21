import './scss/style.scss';
import config from './db_config.js';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import scrollIntoView from 'scroll-into-view-if-needed';

const app = initializeApp(config);

const db = getFirestore(app);

/**
 * sends the message to the database - fgv ami az atadbázisba beírja a createMessage fgv által leszedett üzenetet
 * @param {object} message the message to send
 */
async function sendMessage(message) {
  const docRef = await addDoc(collection(db, 'messages'), message);
  console.log('Document written with ID: ', docRef.id);
}

// függvény, ami leveszi az üzenetet a html oldalról
function createMessage() {
  const message = document.querySelector('#message').value;
  const username = document.querySelector('#nickname').value;
  const date = Timestamp.now();

  return { message, username, date };
  // ez is lehetne: return { message: message, username: username, date: date };
}

// fgv ami kiolvassa az adatbázisból az üzeneteket, időrenbe rendezi, és kiírja a displayMessage fgv-el:

async function displayAllMessages() {
  const q = query(collection(db, 'messages'), orderBy('date', 'asc'));
  const messages = await getDocs(q);
  document.querySelector('#messages').innerHTML = '';
  messages.forEach((doc) => {
    displayMessage(doc.data());
  });
}

function displayMessage(message) {
  const msgDate = message.date.toDate().toLocaleString('hu-HU');

  const messageHTML = /*html*/ `

  <div class="message">
            <i class="fas fa-user"></i>
            <div>
              <span class="username">
                ${message.username}
                <time>${msgDate}</time>
              </span>
              <br />
              <span class="message-text">${message.message}</span>
            </div>
            <div class="message-edit-buttons">
              <i class="fas fa-trash-alt"></i>
              <i class="fas fa-pen"></i>
            </div>
    </div>

          `;
  document.querySelector('#messages').insertAdjacentHTML('beforeend', messageHTML);
  scrollIntoView(document.querySelector('#messages'), {
    scrollMode: 'if-needed',
    block: 'end'
  });
}

function handleSubmit() {
  const message = createMessage();
  sendMessage(message);
  // displayMessage(message);  ez nem kell mert az onsnapshot használatával már lefut

  // It was not a task in the homework, but I like better to clear message input box after sending (or hitting Enter):
  document.querySelector('#message').value = '';
}

document.querySelector('#send').addEventListener('click', () => {
  const message = createMessage();
  if (message.message && message.username) {
    handleSubmit();
  }
});

// enter gomb megnyomásával is küldje el az üzenetet:
document.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    handleSubmit();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  displayAllMessages();
});

// document.querySelector('#messages').innerHTML = '';

let initialLoad = true;

const q = query(collection(db, 'messages'), orderBy('date', 'asc'));
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('added');
      if (!initialLoad) {
        displayMessage(change.doc.data());
      }
    }
    if (change.type === 'modified') {
      console.log('Modified');
    }
    if (change.type === 'removed') {
      console.log('Removed');
    }
  });
  initialLoad = false;
});
