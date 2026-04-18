 fetch('/components/header.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('header-placeholder').innerHTML = html;
        });

 fetch('/components/menuoptions.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('menuOptions').innerHTML = html;
        });


