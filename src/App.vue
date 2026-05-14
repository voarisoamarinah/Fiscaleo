<template>
  <div class="background"></div>
  <div class="background-blur"></div>

  <div class="content">
    <router-view />
  </div>
</template>

<style>
:root {
  --primary-color: #0367FC;
  --secondary-color: #D2F601;
  --dark-color: #161616;
  --light-color: #f5f5f5;
  --danger-color: #e74c3c;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
}

@font-face {
  font-family: 'Gendy';
  src: url('@/assets/fonts/Gendy.otf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

html,
body {
  width: 100%;
  height: 100%;
  background-color: var(--light-color);
}

.background {
  position: fixed;
  /* fixe en fond */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* tout en dessous */
  overflow: hidden;
}

.background::before,
.background::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  filter: blur(80px);
}

.background::before {
  width: 1000px;
  height: 1000px;
  background: var(--secondary-color);
  opacity: 0.25;
  top: -400px;
  left: -200px;
}

.background::after {
  width: 500px;
  height: 500px;
  background: var(--primary-color);
  opacity: 0.25;
  top: -300px;
  left: 650px;
}

.background-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(80px);
  z-index: 1;
  /* juste au-dessus du background mais en dessous du contenu */
}
.content {
  position: relative;
  z-index: 2;
}

</style>
