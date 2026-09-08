<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const cursorEl = ref(null)
const introEl = ref(null)
const headerEl = ref(null)
const heroDataCanvas = ref(null)
let cleanupHeroData
let cleanupCursor
const proofSection = ref(null)
let cleanupHorizontalProof
let cleanupSmoothScroll
const activeService = ref(0)
const serviceSteps = ref([])
const serviceColors = ['#e12afb', '#00d1ff', '#2b7fff', '#00c951']
let serviceObserver

function trackServiceStep(element, index) {
  if (element) serviceSteps.value[index] = element
}

function handleServicePointer(event) {
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--pointer-x', ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3))
  event.currentTarget.style.setProperty('--pointer-y', ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3))
}

function resetServicePointer(event) {
  event.currentTarget.style.setProperty('--pointer-x', 0)
  event.currentTarget.style.setProperty('--pointer-y', 0)
}
const achievements = [
  {
    metric: '330K',
    label: 'TikTok views',
    detail: 'Virality from zero. Reached 328,900 views on a brand-new account in 14 videos.',
    image: '/achievements/tiktok-growth-330k-views.webp',
    alt: 'TikTok analytics showing 328,900 views on an account grown by Alan (Alin) D. Ferenczi',
    color: 'magenta',
  },
  {
    metric: '7,000+',
    label: 'Community members',
    detail: 'Helped build Influencer Accelerator into one of Southeast Europe’s largest creator communities.',
    image: '/achievements/influencer-accelerator-7000-members.webp',
    alt: 'Influencer Accelerator analytics showing more than 7,000 community members',
    color: 'cyan',
  },
  {
    metric: '+120K',
    label: 'Search impressions',
    detail: 'Took a new website in a small niche from zero to +120,000 organic impressions in less than 3 months.',
    image: '/achievements/organic-search-126k-impressions.webp',
    alt: 'Google Search Console showing 126,000 impressions and 604 clicks for a new website',
    color: 'blue',
  },
  {
    metric: '#27',
    label: 'US App Store rank',
    detail: 'Built and grew Crack The Code to number 27 in its US App Store category within weeks of launch.',
    image: '/achievements/crack-the-code-app-store-number-27.webp',
    alt: 'Crack The Code ranked number 27 in its US App Store category',
    color: 'green',
  },
]

const services = [
  {
    number: '01',
    title: 'Find the hack for you',
    copy: 'I audit your business, brand, product, customer journey, and numbers to find what are the channels that work for you.',
  },
  {
    number: '02',
    title: 'Build the growth engine',
    copy: 'I turn strategy into an operating system: acquisition, content, conversion, CRM, automation, and business intelligence working together.',
  },
  {
    number: '03',
    title: 'Run focused experiments',
    copy: 'We prioritize the few bets most likely to move revenue, ship them quickly, and keep only what the data supports.',
  },
  {
    number: '04',
    title: 'Long term solutions',
    copy: 'One post going viral is not growth. Repeatable acquisition processes are. SEO might take 3 months to build but it is THE GIFT that keeps on giving.',
  },
]

onMounted(async () => {
  serviceObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) activeService.value = Number(entry.target.dataset.index)
    }),
    { rootMargin: '-32% 0px -48%', threshold: 0.2 },
  )
  serviceSteps.value.forEach((step) => serviceObserver.observe(step))

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (heroDataCanvas.value && introEl.value && headerEl.value) {
    const { initHeroDataScene } = await import('./heroDataScene')
    const journeySections = [...document.querySelectorAll('[data-journey-scene]')]
    cleanupHeroData = initHeroDataScene(heroDataCanvas.value, headerEl.value, journeySections, { animate: !reducedMotion })
  }
  if (!reducedMotion) {
    const { initSmoothScroll } = await import('./smoothScroll')
    cleanupSmoothScroll = initSmoothScroll()
  }
  if (cursorEl.value && window.matchMedia('(pointer: fine)').matches) {
    const { initCustomCursor } = await import('./customCursor')
    cleanupCursor = initCustomCursor(cursorEl.value)
  }
  if (proofSection.value) {
    const { initHorizontalProof } = await import('./horizontalProof')
    cleanupHorizontalProof = initHorizontalProof(proofSection.value)
  }
})

onBeforeUnmount(() => {
  cleanupHeroData?.()
  cleanupCursor?.()
  cleanupHorizontalProof?.()
  cleanupSmoothScroll?.()
  serviceObserver?.disconnect()
})
</script>

<template>
  <div class="site-shell">
    <div ref="cursorEl" aria-hidden="true">
      <div class="cursor-trail-layer">
        <span data-trail class="cursor-smoke"></span>
      </div>
    </div>
    <a class="skip-link" href="#main">Skip to content</a>

    <header ref="headerEl" class="site-header">
      <a class="header-brand" href="#top" aria-label="Alan (Alin) D. Ferenczi, home">
        <strong>Alan (Alin) Ferenczi</strong>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#portfolio">Portfolio</a>
        <a href="#approach">Approach</a>
        <a href="#services">Services</a>
      </nav>
      <a class="header-cta" href="#booking">
        Book a call
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
      </a>
    </header>

    <main id="main">
      <canvas ref="heroDataCanvas" class="growth-journey-canvas" aria-hidden="true"></canvas>
      <div ref="introEl" class="journey-intro" data-journey-scene>
        <section id="top" class="hero hero-light" aria-labelledby="hero-title">
          <div class="hero-content reveal">
          <h1 id="hero-title">
            <span class="hero-line-primary" data-text="Strategy">Strategy</span>
            <span class="hero-line-accent" data-text="to revenue.">to revenue.</span>
          </h1>
          <div class="hero-intro-grid reveal delay-one">
            <p class="hero-lead">I build personalized growth engines to turn strategy into revenue.</p>
            <p>Fractional Head of Growth for founder-led companies. I don't do marketing. I connect acquisition, content, automation, reporting, and customer success into one repeatable engine.</p>
          </div>
          <div class="hero-principles reveal delay-two" aria-label="Working principles">
            <div><span>No cookie-cutter solutions</span><p>A system designed around your business, offering, brand and values.</p></div>
            <div><span>Automation as the core</span><p>A modern growth engine is one that scales. More fuel, more power.</p></div>
            <div><span>Data driven</span><p>Strategies defined on stats, customer behavior and business outcomes.</p></div>
            <div><span>Human in the loop</span><p>Souless products and content don't work. The secret sauce is your team.</p></div>
          </div>
        </div>
        <a class="hero-scroll-button reveal delay-two" href="#portfolio">
          <span>Scroll to explore</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v13M5 11l5 5 5-5" /></svg>
        </a>
        <p class="scroll-note">Strategy · Systems · Execution</p>
        </section>
      </div>

      <section id="portfolio" ref="proofSection" class="proof-section dark-section" data-journey-scene aria-labelledby="proof-title">
        <div class="proof-sticky">
          <div class="proof-header">
            <div class="section-label"><span>02</span> Portfolio</div>
            <div class="section-heading">
              <h2 id="proof-title">I walk the <em>talk.</em></h2>
              <p>Four projects. One outcome at a time.</p>
            </div>
          </div>
          <div class="proof-viewport">
            <div class="proof-track">
              <article v-for="(item, index) in achievements" :key="item.metric" class="proof-slide" :class="`accent-${item.color}`">
                <div class="proof-slide-copy">
                  <span class="proof-index">{{ String(index + 1).padStart(2, '0') }} / {{ String(achievements.length).padStart(2, '0') }}</span>
                  <strong>{{ item.metric }}</strong>
                  <h3>{{ item.label }}</h3>
                  <p>{{ item.detail }}</p>
                </div>
                <div class="proof-slide-image">
                  <img :src="item.image" :alt="item.alt" width="960" height="700" loading="lazy" decoding="async" />
                </div>
              </article>
            </div>
          </div>
          <div class="proof-footer" aria-hidden="true">
            <span><b data-proof-current>01</b> / {{ String(achievements.length).padStart(2, '0') }}</span>
            <div class="proof-progress"><i></i></div>
            <span>Scroll →</span>
          </div>
        </div>
      </section>

      <section class="fractional-role-section" data-journey-scene aria-labelledby="fractional-role-title">
        <div class="section-label"><span>03</span> Inside the role</div>
        <div class="fractional-role-layout">
          <div class="fractional-role-heading">
            <h2 id="fractional-role-title">What a fractional growth lead <em>actually does.</em></h2>
            <p>Senior ownership without adding another full-time executive layer.</p>
          </div>
          <div class="fractional-role-stage">
            <div class="fractional-role-grid">
              <article>
                <span>01</span>
                <h3>Find the constraint</h3>
                <p>Audit the journey, channels, numbers, and team to identify what is truly blocking growth.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Build the system</h3>
                <p>Connect acquisition, content, conversion, automation, reporting, and customer success.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Run and transfer it</h3>
                <p>Lead execution, prove the loop, document the process, and leave your team an engine they can own.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="services" class="services-section dark-section" data-journey-scene aria-labelledby="services-title" @pointermove="handleServicePointer" @pointerleave="resetServicePointer">
        <div class="section-label"><span>04</span> Fractional growth leadership</div>
        <div class="service-story">
          <div class="service-visual-wrap">
            <h2 id="services-title">One owner.<br /><em>The whole engine.</em></h2>
            <aside class="service-visual" :style="{ '--active-color': serviceColors[activeService] }" aria-hidden="true">
              <div class="visual-grid"></div>
              <div class="visual-orbit orbit-large"></div>
              <div class="visual-orbit orbit-small"></div>
              <div class="visual-core"><span></span></div>
              <div class="visual-copy">
                <span>Growth system</span>
                <strong>{{ services[activeService].number }}</strong>
                <p>{{ services[activeService].title }}</p>
              </div>
            </aside>
          </div>
          <div class="service-list">
            <article
              v-for="(service, index) in services"
              :key="service.number"
              :ref="(element) => trackServiceStep(element, index)"
              :data-index="index"
              class="service-row"
              :class="{ active: activeService === index }"
            >
              <span class="service-number">{{ service.number }}</span>
              <div>
                <h3>{{ service.title }}</h3>
                <p>{{ service.copy }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="approach" class="approach-section" data-journey-scene aria-labelledby="approach-title">
        <div class="section-label"><span>05</span> Best fit</div>
        <div class="approach-grid">
          <div>
            <h2 id="approach-title">Are you a founder<br />ready to <em>move?</em></h2>
          </div>
          <ul class="fit-list">
            <li><span>01</span><p>You have product and early traction, but growth is inconsistent.</p></li>
            <li><span>02</span><p>Marketing, sales, product, and operations are pulling in different directions.</p></li>
            <li><span>03</span><p>You need a close partner, not another hire.</p></li>
            <li><span>04</span><p>You care about long term results, not short hype.</p></li>
          </ul>
        </div>
      </section>


      <section id="booking" class="cta-section" data-journey-scene aria-labelledby="cta-title">
        <div class="cta-noise"></div>
        <p class="eyebrow">Ready when you are</p>
        <h2 id="cta-title">Are you <br /><span>ready to grow?</span></h2>
        <p>Bring the numbers, the bottleneck, and the ambition. We will start there.</p>
        <div class="booking-frame">
          <iframe
            src="https://cal.com/alin-ferenczi/discovery-call?embed=true"
            title="Book a discovery call with Alan (Alin) D. Ferenczi"
            loading="lazy"
            allow="payment"
          ></iframe>
        </div>
      </section>
    </main>

    <footer>
      <p>Alan (Alin) D. Ferenczi · Fractional Head of Growth · Strategy, systems, execution.</p>
      <div class="footer-links">
        <a href="https://x.com/alivexpX" target="_blank" rel="noopener noreferrer">X / Twitter</a>
        <a href="https://www.linkedin.com/in/alin-daniel-ferenczi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://www.venture-chain.com" target="_blank" rel="noopener noreferrer">Venture Chain</a>
        <a href="https://www.freequantumcomputing.com" target="_blank" rel="noopener noreferrer">Free Quantum Computing</a>
        <a href="#top">Back to top ↑</a>
      </div>
      <small>© 2026 Alan (Alin) D. Ferenczi</small>
    </footer>
  </div>
</template>
