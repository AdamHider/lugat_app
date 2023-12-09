<template>
  <div class="background">
  <div class="stars">
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
  <div class="star"></div>
</div>
</div>
</template>


<style scoped lang="scss">
@mixin sp-layout {
  @media screen and (max-width: 750px) {
    @content;
  }
}

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
  /*background: radial-gradient(ellipse at bottom, #2ca85c 0%, #0c4f39 100%);*/
  background: radial-gradient(ellipse at bottom, #49c88c 0%, #0c4235 100%);
  overflow: hidden;
}

@function random_range($min, $max) {
  $rand: random();
  $random_range: $min + floor($rand * (($max - $min) + 1));
  @return $random_range;
}

.stars {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 120%;
}

.star {
  $star-count: 50;
  --star-color: #97f7c1;
  --star-tail-length: 6em;
  --star-tail-height: 2px;
  --star-width: calc(var(--star-tail-length) / 6);
  --fall-duration: 9s;
  --tail-fade-duration: var(--fall-duration);

  position: absolute;
  top: var(--top-offset);
  left: var(--left-offset);
  transform: rotateZ(45deg);
  filter: drop-shadow(0 0 6px #97f7c1);
  animation: fall var(--fall-duration) var(--fall-delay) linear infinite;

  @include sp-layout {
    // For mobile performance, tail-fade animation will be removed QAQ
    animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
  }

  @for $i from 1 through $star-count {
    &:nth-child(#{$i}) {
      --star-tail-length: #{random_range(5em, 7.5em)};
      --top-offset: #{random_range(110vh, 95vh)};
      --left-offset: #{random_range(-50vw, 150vw)};
      --fall-duration: #{random_range(6s, 12s)};
      --fall-delay: #{random_range(0s, 10s)};
    }
  }

  &::before {
    position: absolute;
    content: '';
    top: 0;
    width: var(--star-tail-length);
    height: var(--star-tail-height);
    color: var(--star-color);
    background: linear-gradient(45deg, #97f7c1, transparent);
    opacity: 0;
    border-radius: 50%;
    animation:  tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
  }

}

@keyframes fall {
  to {
    transform: rotate(45deg) translateX(-250vh);
  }
}

@keyframes tail-fade {
  0%, 20% {
    width: 0;
    opacity: 0;
  }
  20%, 50% {
    width: var(--star-tail-length);
    opacity: 1;
  }

  70%, 80% {
    width: 0;
    opacity: 0.4;
  }

  100% {
    width: 0;
    opacity: 0;
  }
}

@keyframes blink {
  50% {
    opacity: 0.6;
  }
}

</style>
