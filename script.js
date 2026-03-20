document.addEventListener("DOMContentLoaded", () => {

  // ---------- FONCTIONS UTILES ----------
  // Fonction debounce : limite la fréquence d'exécution d'une fonction (utile pour input et resize)
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // Fonction pour retirer les accents d'une chaîne de caractères (utile pour la recherche)
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // ---------- MENU MOBILE ----------
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if(menuToggle && navLinks){
    // Ouverture / fermeture du menu mobile au clic
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');   // active le menu
      menuToggle.classList.toggle('open');  // change l'état du bouton
    });

    // Fermeture du menu lorsqu'on clique sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('open');
      });
    });

    // Fermeture du menu lorsqu'on clique à l'extérieur
    document.addEventListener('click', e => {
      if(!navLinks.contains(e.target) && !menuToggle.contains(e.target)){
        navLinks.classList.remove('active');
        menuToggle.classList.remove('open');
      }
    });
  }

  // ---------- SLIDER / DIAPORAMA ----------
  const slides = document.querySelectorAll(".dgss-slider .slide");
  const prevBtn = document.querySelector(".dgss-slider .prev");
  const nextBtn = document.querySelector(".dgss-slider .next");
  const slider = document.querySelector(".dgss-slider");
  const indicatorsContainer = document.querySelector(".dgss-indicators");
  let currentIndex = 0;
  let slideInterval;
  const intervalTime = 9000; // 9 secondes entre chaque slide

  // Création des indicateurs (petits points sous le slider)
  function createIndicators(){
    if(!indicatorsContainer) return;
    indicatorsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.setAttribute('aria-label', `Slide ${i+1}`);
      // Changement de slide au clic sur l'indicateur
      dot.addEventListener('click', () => { 
        stopSlider(); 
        currentIndex = i; 
        showSlide(i); 
        startSlider(); 
      });
      indicatorsContainer.appendChild(dot);
    });
  }

  // Affiche la slide correspondant à l'index
  function showSlide(index){
    slides.forEach((s,i)=>s.classList.toggle('active', i===index));
    const dots = document.querySelectorAll('.dgss-indicators span');
    dots.forEach((d,i)=>d.classList.toggle('active', i===index));

    // Ajuste la hauteur du slider selon l'image active
    const img = slides[index].querySelector('img');
    if(img && img.complete) updateSliderHeight(img);
    else if(img) img.onload = ()=>updateSliderHeight(img);
  }

  // Met à jour la hauteur du slider pour un affichage fluide sur mobile et desktop
  function updateSliderHeight(img){
    if(!img || !slider) return;
    const maxHeight = window.innerWidth <= 768 ? 300 : 600; // hauteur max selon écran
    let height = (img.naturalHeight / img.naturalWidth) * slider.clientWidth;
    if(height>maxHeight) height=maxHeight;
    slider.style.transition = "height 0.3s ease";
    slider.style.height = height + "px";
  }

  // Navigation entre les slides
  function nextSlide(){ currentIndex = (currentIndex+1)%slides.length; showSlide(currentIndex);}
  function prevSlide(){ currentIndex = (currentIndex-1+slides.length)%slides.length; showSlide(currentIndex);}
  function startSlider(){ slideInterval=setInterval(nextSlide, intervalTime);}
  function stopSlider(){ clearInterval(slideInterval);}

  // Initialisation du slider
  function initSlider(){
    if(slides.length===0) return;
    createIndicators();
    if(nextBtn && prevBtn){
      nextBtn.addEventListener('click', ()=>{ stopSlider(); nextSlide(); startSlider();});
      prevBtn.addEventListener('click', ()=>{ stopSlider(); prevSlide(); startSlider();});
    }
    if(slider){
      // Pause automatique au survol ou au touch
      slider.addEventListener('mouseenter', stopSlider);
      slider.addEventListener('mouseleave', startSlider);
      slider.addEventListener('touchstart', stopSlider);
      slider.addEventListener('touchend', ()=>setTimeout(startSlider,3000));

      // Gestion du swipe mobile
      let startX=0;
      slider.addEventListener('touchstart', e=>startX=e.touches[0].clientX);
      slider.addEventListener('touchend', e=>{
        let endX=e.changedTouches[0].clientX;
        if(startX-endX>50) nextSlide();
        else if(endX-startX>50) prevSlide();
      });
    }
    showSlide(currentIndex);
    startSlider();
  }

  // ---------- DOCUMENTS ----------
  // Liste des documents disponibles
  const documents = [
    { titre: "Décret n° 2012-24 du 2 Février 2012", categorie: "Attribution et Organisation de la DGSS", lien: "Documents/Décret1.pdf" },
    { titre: "Arrêté n° 6438 MTSS-CAB", categorie: "Nomination des membres de la commission technique du comité de pilotage de mise en place du régime dassurance maladie", lien: "Documents/ArrêtéNo6438MTSS-CAB.pdf" },
    { titre: "Arrêté n° 14428 MTSS-CAB", categorie: "Attributions et Organisation des directions départementales de la Sécurité Sociale", lien: "Documents/ArrêtéNo14428MTSS-CAB.pdf" },
    { titre: "Loi n° 37-2014", categorie: "Instituant le Régime d'assurance maladie universelle", lien: "Documents/Loi-n°37-2014.pdf" },
    { titre: "Loi n° 12-2015 du 31 août 2015", categorie: "Création de la Caisse d'assurance maladie ", lien: "Documents/Loin°12-2015du31août2015.pdf" },
  




  ];

  // Affichage des documents selon le filtre
  function renderDocuments(filter=''){
    const tableBody = document.getElementById('documentList');
    if(!tableBody) return;
    tableBody.innerHTML='';
    const cleanFilter = removeAccents(filter.toLowerCase());
    const filtered = documents.filter(d=>{
      return removeAccents(d.titre.toLowerCase()).includes(cleanFilter) ||
             removeAccents(d.categorie.toLowerCase()).includes(cleanFilter);
    });
    if(filtered.length===0){
      tableBody.innerHTML='<tr><td colspan="3" style="text-align:center;color:#888;padding:20px;">Aucun document trouvé.</td></tr>';
      return;
    }
    const frag=document.createDocumentFragment();
    filtered.forEach(doc=>{
      const row=document.createElement('tr');
      const regex = new RegExp(filter,'gi');
      row.innerHTML=`<td>${doc.titre.replace(regex,m=>`<mark>${m}</mark>`)}</td>
                     <td>${doc.categorie.replace(regex,m=>`<mark>${m}</mark>`)}</td>
                     <td><a href="${doc.lien}" target="_blank">Lire</a></td>`;
      frag.appendChild(row);
    });
    tableBody.appendChild(frag);
  }

  // Recherche en temps réel avec debounce
  const searchBar = document.getElementById('searchBar');
  if(searchBar) searchBar.addEventListener('input', debounce(e=>renderDocuments(e.target.value),250));
  renderDocuments();

  // ---------- FOOTER DYNAMIQUE ----------
  // Mise à jour de l'année automatiquement
  const footerText = document.querySelector(".footer-bottom p:first-child");
  if(footerText){
    const year = new Date().getFullYear();
    footerText.innerHTML = `© ${year} Ministère de la Fonction Publique, du Travail et de la Sécurité Sociale. Tous droits réservés.`;
  }

  // ---------- SMOOTH SCROLL ----------
  // Défilement fluide pour tous les liens ancrés
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click', e=>{
      e.preventDefault();
      const target=document.querySelector(anchor.getAttribute('href'));
      if(target){
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({top:offsetTop, behavior:'smooth'});
      }
    });
  });

  // ---------- GESTION DU REDIMENSIONNEMENT ----------
  // Recalcule la hauteur du slider lors du resize
  window.addEventListener('resize', debounce(()=>{
    const img=document.querySelector(".slide.active img");
    if(slider && img) updateSliderHeight(img);
  },200));

  // ---------- INITIALISATION ----------
  initSlider();
});