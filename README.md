# grades_normalizer
npm install pdfreader

npm i --save csvtojson

Como primer parámetro pasar el nombre del grupo, que debe ser el mismo en el CSV
y en el folder que contiene los PDFs de los alumnos dentro de /pdf

node calif.js VI_AGRO_A

Como segundo parámetro (opcional) se puede pasar el nombre del alumno entre 
comillas simples, esto hará que se analice solo un usuario y es mucho más rápido:

node calif.js VI_AGRO_A 'GARCIA CONTRERAS PAOLA'
