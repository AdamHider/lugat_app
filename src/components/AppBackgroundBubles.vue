<template>
  <div :class="`background ${(intense) ? 'intensive' : ''}`">
    <div class="background-overlay intense"></div>
    <div class="particles">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
  </div>
</div>
</template>

<script setup>
import { watch, ref, toRef, reactive } from "vue";

const emit = defineEmits(["update:dialogOpened"]);

const blink = ref(false)

const props = defineProps({
  intense: Boolean
});

const {intensive: intensive} = toRef(props)


</script>

<style scoped lang="scss">

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  transition: all 1s ease;
  /*background: radial-gradient(ellipse at bottom, #01b27b 0%,  #006955 100%);*/
 /*background: radial-gradient(ellipse at bottom, #0d9167 0%,  #024438 100%);*/
 background: radial-gradient(ellipse at bottom, #13c460 0%, #045e73 100%);


	background-size: 200% 200%;
	animation: gradient 8s ease infinite;

  overflow: hidden;
}
.background .background-overlay{
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 1s ease;
}
.background .background-overlay.intense{
  background: radial-gradient(ellipse at bottom, #11cc65  0%,  #058b73 100%);
	background-size: 200% 200%;
	animation: gradient 8s ease infinite;
}
.background.intensive .background-overlay.intense {
  opacity: 1;
}
body {
  margin: 0;
  overflow: hidden;
}


$particleSize: 5px;
$animationDuration: 12;
$amount: 40;
.background .particles span {
  width: $particleSize;
  height: $particleSize;
  border-radius: $particleSize;
  backface-visibility: hidden;
  position: absolute;
  animation-name: move;
  animation-duration: $animationDuration;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  transition: all 1s ease;
  $colors: (
    #47e792,
    #20d36d,
    #13c460
  );
  @for $i from 1 through $amount {
    &:nth-child(#{$i}) {
      color: nth($colors, random(length($colors)));
      top: random(100) * 1%;
      left: random(100) * 1%;
      animation-duration: (random($animationDuration)) + 10s;
      animation-delay: (random($animationDuration + 10)) * -1s;
      transform-origin: (random(50) - 25) * 1vw (random(50) - 25) * 1vh;
      $blurRadius: (random() + 0.5) * $particleSize * 0.5;
      $x: if(random() > 0.5, -1, 1);
      box-shadow: ($particleSize * 2 * $x) 0 $blurRadius currentColor;
    }
  }
}
.background.intensive .particles span{
  color: white;
  width: 3px;
  height: 3px;
}

@keyframes move {
  100% {
    transform: translate3d(0, 0, 1px) rotate(360deg);
  }
}
@keyframes gradient {
	0% {
		background-position: 50% 0%;
	}
	50% {
		background-position: 50% 100%;
	}
	100% {
		background-position: 50% 0%;
	}
}

</style>
