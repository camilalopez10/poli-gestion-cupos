document.querySelectorAll('.go-module').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const target = btn.getAttribute('data-target');
    fetch('modules/' + target + '/view.php').then(r=>r.text()).then(h=>{
      document.getElementById('contenido').innerHTML = h;
    });
  });
});