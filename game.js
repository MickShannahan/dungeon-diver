const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// -------------------------------------------------------
// #region 📺 SCREEN MANAGER
const startScreen = document.getElementById('start-screen')
const gameScreen = document.getElementById('game-screen')
const scoreScreen = document.getElementById('score-screen')
const shopScreen = document.getElementById('shop-screen')

function changeScreen(screenName) {
  switch (screenName) {
    case 'start':
      scoreScreen.classList.remove('active')
      gameScreen.classList.remove('active')
      startScreen.classList.add('active')
      break;
    case 'score':
      drawScoreboard()
      gameScreen.classList.remove('active')
      startScreen.classList.remove('active')
      scoreScreen.classList.add('active')
      break;
    case 'shop':
      gameScreen.classList.remove('active')
      shopScreen.classList.add('active')
      drawShopCards()
      break;
    case 'game':
      shopScreen.classList.remove('active')
      scoreScreen.classList.remove('active')
      startScreen.classList.remove('active')
      gameScreen.classList.add('active')
      drawMonster()
      break;
  }
}


function drawMonster() {
  if (!currentMonster) return
  const monsterElement = gameScreen.querySelector('#monster')
  const nameElement = monsterElement.querySelector('.name')
  const imageElement = monsterElement.querySelector('img')
  const healthElement = monsterElement.querySelector('.health-bar')

  nameElement.innerHTML = currentMonster.name + `<kbd>pwr:${currentMonster.level}</kbd>`
  imageElement.src = `./assets/imgs/${currentMonster.picture}`
  healthElement.innerText = currentMonster.health + ' 💖'
  healthElement.style.width = currentMonster.healthPercent
}

function drawPlayer() {
  const playerElement = gameScreen.querySelector('#player')
  const nameElement = playerElement.querySelector('.name')
  const pictureElement = playerElement.querySelector('img')
  const healthElement = playerElement.querySelector('.health-bar')
  const shieldElement = playerElement.querySelector('.shield-bar')

  nameElement.innerText = player.name
  healthElement.innerText = player.health + ' 💖'
  healthElement.style.width = ((player.health / 25) * 100) + '%'
  shieldElement.style.width = (player.health - 25) + '%'
}

function drawScoreboard() {
  let players = loadData()
  players.sort((a, b) => b.score - a.score)

  let content = ''
  players.forEach(player => content += `
    <div class="col-6">${player.picture} ${player.name}</div>
    <div class="col-6">${player.score}</div>
    <hr class="border-primary"/>
    `)
  document.getElementById('scores').innerHTML = content
}

function drawHand() {
  let handHTML = ''
  player.hand.forEach(card => handHTML += card.html)
  document.getElementById('player-hand').innerHTML = handHTML
}

function drawShopCards() {
  console.log(shop);
  let shopHTML = ''
  shop.forEach(card => shopHTML += `
  <div class="shop-card">
  ${card.html}
  <button class="btn btn-primary" onclick="addCardToDeck(${card.id})">Add to deck</button>
  </div>
  `)
  document.getElementById('shop-cards').innerHTML = shopHTML
}

const reportWindow = document.getElementById('report-window')

function writeToReport(message, color = 'light') {
  reportWindow.innerHTML += `<div class="mb-1 text-${color}">${message}</div>`
  reportWindow.scroll({ top: reportWindow.scrollHeight, behavior: 'smooth' })
}

function clearReport() {
  reportWindow.innerHTML = ``
}

// #endregion

// -------------------------------------------------------
// #region Cards + shop
class Card {
  constructor(name, picture, type, damage) {
    this.id = Math.random().toString()
    this.name = name
    this.picture = picture
    this.type = type
    this.damage = damage
    this.html = `
<button class="rps-card" onclick="playCard(${this.id})">
  <div>${this.picture}</div>
  <div class="fs-2">${this.damage}</div>
  <small>${this.name}</small>
</button>
`
  }
  get elm() {
    const element = document.createElement('button')
    element.classList.add('rps-card')
    element.innerHTML = `  <div>${this.picture}</div>
    <div class="fs-2">${this.damage}</div>
    <small>${this.name}</small>`
    element.addEventListener('click', () => playCard(this.id))
    return element
  }
}
const rock = new Card('rock', '🪨', '🪨', 5)
const paper = new Card('paper', '📄', '📄', 5)
const scissors = new Card('scissors', '✂️', '✂️', 5)
const potion = new Card('🪨lose to +💖', '🧪', '🪨', -8)
const potion2 = new Card('📄lose to +💖', '🧪', '📄', -8)
const rockX2 = new Card('rock +', '🥌', '🪨', 7)
const paperX2 = new Card('paper +', '📃', '📄', 7)
const scissorsX2 = new Card('scissors +', '⚔️', '✂️', 7)
const coconut = new Card('Coconut', '🥥', '🪨', 6)
const knife = new Card('Knife', '🔪', '✂️', 10)
const fire = new Card('fire', '🔥', '✂️', 15)
const moon = new Card('moon', '🌕', '🪨', 20)
const darkMoon = new Card('dark moon', '🌑', '🪨', 40)
const declaration = new Card('Declaration', '📜', '📄', 15)
const pager = new Card('Pager', '📟', '📄', 20)
const draw2 = new Card('Draw 2', '🎴', '🎴', 2)
const draw4 = new Card('Draw 4', '🃏', '🎴', 4)
const weakPaper = new Card('Wet Paper', '🧻', '📄', 1)
const weakScissors = new Card('Fake Scissors', '✌️', '✂️', 1)
const bomb = new Card('Bomb', '💣', '🪨', 60)
const sword = new Card('Sword', '🤺', '✂️', 60)
const tree = new Card('Money', '💴', '📄', 60)

const cardPool = [rock, paper, scissors, potion, potion, rockX2, paperX2, scissorsX2, coconut, knife, fire, declaration, draw2, weakPaper, weakScissors, potion2, potion2]
const shop = []

function setupShop() {
  shop.length = 0
  for (let i = 0; i < 3; i++) {
    let random = cardPool[Math.floor(Math.random() * cardPool.length)]
    console.log('adding to shop', random);
    shop.push(random)
  }
  classAbility('🧙‍♂️')
  classAbility('🧙')
}

// #endregion

// -------------------------------------------------------
// #region 😊 Player Stats

const playerElm = document.getElementById('player')
playerElm.addEventListener('animationend', () => playerElm.style.animation = 'unset')

const player = {
  name: 'slate slabrock',
  class: '👲',
  health: 25,
  score: 0,
  handSize: 6,
  /** @type {Card[]} */
  deck: [],
  /** @type {Card[]} */
  hand: []
}


//#endregion



// -------------------------------------------------------
//#region 🧌 Monsters
class Monster {
  /**
   * @param {string} name 
   * @param {string} picture 
   * @param {number} health 
   * @param {string[]} options 
   */
  constructor(name, picture, health, options, extra) {
    this.name = name
    this.picture = picture
    this.health = health
    this.maxHealth = health
    this.level = 1
    this.options = options
    this.attack = '🪨'
    if (extra) extra()
  }

  get randomOption() {
    return this.options[Math.floor(Math.random() * this.options.length)]
  }
  get healthPercent() {
    return Math.round((this.health / this.maxHealth) * 100) + '%'
  }
}



const monsters = [
  new Monster('Thok', 'beaver.png', 10, ['🪨']),
  new Monster('Crash', 'tiger.png', 25, ['✂️', '📄']),
  new Monster('Big Tooth', 't-rex.png', 30, ['✂️', '🪨', '📄']),
  new Monster('Snips', 'crab.png', 40, ['✂️', '📄', '✂️', '✂️']),
  new Monster('Sasuke', 'whale.png', 65, ['✂️', '✂️', '✂️', '🪨', '📄', '📄']),
]

/** @type {Monster} */
let currentMonster = null

//#endregion


// -------------------------------------------------------
//#region 🕹️ Game Actions

function startGame() {
  event.preventDefault()
  const form = event.target
  player.name = form.name.value
  player.class = form.class.value
  player.deck = [rock, rock, rock, paper, paper, paper, scissors, scissors, scissors, potion, draw2]
  classAbility(player.class)
  // resetGame()
  nextMonster()
  drawMonster()
  shuffleDeck()
  createHand()
  drawPlayer()
  drawHand()
  monsterAction()
  changeScreen('game')
}

function damagePlayer(damage) {
  if (damage < 1) return healPlayer(damage * -1)
  // playerElm.style.animation = 'none'
  // playerElm.offsetWidth
  playerElm.style.animation = 'shakeX .5s'
  player.health -= damage

  drawPlayer()
  if (player.health <= 0) {
    playerDies()
  }
}

function healPlayer(health) {
  playerElm.style.animation = 'grow .5s'
  player.health += health
  writeToReport(`+💖(${health})`, 'success')
  drawPlayer()
}

let dumbBells = 0
function classAbility(classType, power = 0) {
  if (player.class != classType) return power
  switch (classType) {
    case '🧞‍♀️':
      healPlayer(power)
      break;
    case '🧛‍♀️':
      healPlayer(power)
      break;
    case '🧙':
    case '🧙‍♂️':
      let card1 = cardPool[Math.floor(Math.random() * cardPool.length)]
      let card2 = cardPool[Math.floor(Math.random() * cardPool.length)]
      shop.push(card1, card2)
      break;
    case '🧜‍♀️':
      let shell = new Card('Conch Shell', '🐚', '🪨', 8)
      let shrimp = new Card('Shrimp', '🍤', '📄', -8)
      let fork = new Card('fork', '🍴', '✂️', 8)
      player.deck.push(shell, shell, shrimp, shrimp, fork, fork)
      break;
    case '🏋️':
      cardPool.length = 0
      let meat = new Card('Steak', '🥩', '🪨', -4)
      let meat2 = new Card('Leg', '🍗', '✂️', -4)
      let meat3 = new Card('Bacon', '🥓', '📄', -4)
      let dumbell = new Card('Train', '💪', '🏋️', 0)
      cardPool.push(meat, meat, meat2, meat2, meat3, meat3, weakPaper, dumbell)
      break;
    case '🧌':
      player.health = 100
      let dung1 = new Card('dung', '💩', '🪨', 10)
      let dung2 = new Card('dung', '💩', '✂️', 10)
      let dung3 = new Card('dung', '💩', '📄', 10)
      player.deck.length = 0
      player.deck.push(dung1, dung2, dung3, dung1, dung2, dung3, weakPaper)
      cardPool.length = 0
      cardPool.push(dung1, dung2, dung3)
  }
  return power
}

function nextMonster() {

  currentMonster = monsters.shift()
  if (!currentMonster) {
    window.alert('You Won!🎊')
    endGame()
  }
  monsterAction()
}

function shuffleDeck() {
  player.deck.sort(() => Math.random() - .5)
  player.deck.sort(() => Math.random() - .5)
  player.deck.sort(() => Math.random() - .5)
}

function createHand() {
  addCardsToHand(player.handSize)
  drawHand()
}

function addCardsToHand(num) {
  for (let i = 0; i < num; i++) {
    if (player.hand.length >= 10) return
    let drawnCard = player.deck.pop()
    if (drawnCard)
      player.hand.push(drawnCard)
    document.getElementById('player-hand').append(drawnCard.elm)
  }
  // drawHand()
}

function addCardToDeck(id) {
  const boughtCard = shop.find(card => card.id == id)
  console.log(boughtCard);
  player.deck.push(boughtCard)
  nextMonster()
  drawMonster()
  changeScreen('game')
  shuffleDeck()
  addCardsToHand(3)
}

function playCard(id) {
  const cardIndex = player.hand.findIndex(card => card.id == id)
  const card = player.hand[cardIndex]
  player.hand.splice(cardIndex, 1)
  player.deck.unshift(card)
  console.log('▶️', card, player.deck, player.hand);
  playerAction(card, card.damage)
  drawHand()
  if (player.hand.length == 0) {
    damagePlayer(1)
    createHand()
  }
}
/**
 * @param {Card} card 
 * @param {Number} damage 
 */
function playerAction(card, damage) {
  console.log(card, currentMonster.attack);
  if (currentMonster.health <= 0 || player.health <= 0) return
  writeToReport(`You play ${card.picture}`)

  if (card.type == '🎴') {
    monsterAction()
    return addCardsToHand(card.damage)
  }
  if (card.type == '💪') {
    dumbBells++
    writeToReport(`Strength increased! +${dumbBells}`, 'info')
    return
  }

  const attack = card.type
  document.getElementById('player-action').innerText = card.picture
  if (attack == currentMonster.attack) { // draw, both loose health
    damagePlayer(Math.round(damage / 3) * currentMonster.level)
    const halfDamage = Math.round(damage / 2)
    currentMonster.health -= halfDamage
    writeToReport(`Tie: -${2}${player.class} | -${halfDamage}${currentMonster.name} `)
  } else if (attack == '🪨' && currentMonster.attack == '📄') {
    damagePlayer(damage)
    writeToReport(`Loss: -${damage}${player.class}`, 'danger')
  } else if (attack == '📄' && currentMonster.attack == '✂️') {
    damagePlayer(damage)
    writeToReport(`Loss: -${damage}${player.class}`, 'danger')
  } else if (attack == '✂️' && currentMonster.attack == '🪨') {
    damagePlayer(damage)
    writeToReport(`Loss: -${damage}${player.class}`, 'danger')
  } else if (currentMonster.attack == '🍾') {
    currentMonster.level += 5
    currentMonster.health -= damage + dumbBells
    writeToReport(`Mr. World Boss increased their level!🍾`)
  } else {
    classAbility('🧛‍♀️', Math.round(damage / 4))
    currentMonster.health -= damage + dumbBells
    writeToReport(`Win: -${damage}${currentMonster.name}`, 'success')
  }

  if (currentMonster.health <= 0) {
    monsterDies()
  }
  monsterAction()
}

function monsterAction() {
  currentMonster.attack = currentMonster.randomOption
  document.getElementById('monster-action').innerHTML = `<div class="grow-in">${currentMonster.attack}</div>`
  drawMonster()
}

function monsterDies() {
  player.score++
  writeToReport(`❕${currentMonster.name} defeated | Score ${player.score}`)
  classAbility('🧞‍♀️', 5)
  let monsterPicture = gameScreen.querySelector('#monster img')
  monsterPicture.classList.add('dead')
  currentMonster.level++
  currentMonster.maxHealth += Math.round(currentMonster.maxHealth / 3)
  currentMonster.health = currentMonster.maxHealth
  monsters.push(currentMonster)
  if (currentMonster.name == 'Mr. World Boss') return endGame()
  setupShop()
  rampDifficulty()
  changeScreen('shop')
  setTimeout(() => {
    monsterPicture.classList.remove('dead')

  }, 2000)
}

function rampDifficulty() {
  console.log('⬆️', player.score);
  switch (player.score) {
    case 4:
      cardPool.push(moon, pager, draw4)
      monsters.forEach(m => m.level++)
      break;
    case 6:
      cardPool.push(darkMoon)
      monsters.forEach(m => m.options.push('✂️', '🪨', '📄'))
      const gg = new Monster('Georgie', 'Georgie1.png', 80, ['🪨', '🪨', '🪨', '✂️', '📄', '📄'])
      monsters.push(gg)
      break;
    case 10:
      monsters.forEach(m => m.maxHealth += 10)
      const dk = new Monster('Dk Khaled', 'djKhaled.png', 100, ['🪨', '✂️', '✂️', '☕', '📄', '📄'])
      monsters.push(dk)
      break;
    case 12:
      cardPool.push(moon, pager, fire, sword, tree, bomb)
      break;
    case 18:
      const Mwb = new Monster('Mr. World Boss', 'mrWorldBoss.png', 365, ['🪨', '✂️', '✂️', '📄', '🍾'], mrWorldBoss)
      monsters.unshift(Mwb)
      break;
  }
}

function playerDies() {
  let playerPicture = gameScreen.querySelector('#player img')
  playerPicture.classList.add('dead')
  setTimeout(() => {
    playerPicture.classList.remove('dead')
    endGame()
  }, 2000)
}

function resetGame() {
  player.health = 10
  player.score = 0
  monsters.forEach(monster => monster.health = monster.maxHealth)
  window.location.reload()
}

function endGame() {
  player.score += player.health
  saveData()
  drawScoreboard()
  changeScreen('score')
}

function mrWorldBoss() {
  const music = document.createElement('audio')
  music.src = './assets/mrWorldBoss.mp3'
  document.body.appendChild(music)
  gameScreen.style.backgroundImage = `url(./assets/imgs/mrWorldBossClub.gif)`
  music.play()
}


// -------------------------------------------------------
//#region 💾 data services

function saveData() {
  let scores = loadData()
  let returningPlayer = scores.find(score => score.name == player.name)

  if (returningPlayer) { // Update current player
    returningPlayer.picture = player.class
    returningPlayer.score = player.score > returningPlayer.score ? player.score : returningPlayer.score
  } else { // add new player
    scores.push(player)
  }
  localStorage.setItem('DD_scores', JSON.stringify(scores))
}

function loadData() {
  const data = localStorage.getItem('DD_scores')
  if (data) {
    let scores = JSON.parse(data)
    return scores
  }
  return [] // when expecting a collection, an empty array is more appropriate than null
}
//#endregion
