document.createElement ('style ')

style.innerHTML = `
html, body{
    height: 100%;
}

body{
    display: flex;
    flex-direction: column-reverse;
}

.chappel-color {
    background-color: #cac6c5;
}

.chappel-wrapper{
    position:relative;
}

.chapel-base{
    width: 100%;
    height: 40px;
}

.chapel.layer{
    background-color: #cac6c5;
    height: 35px;
    margin: 0 auto;
}

.center-bar{
    background-color: #cac6c5;
    width: 10px;
    position: absolute;
    left: 50%
    top: -40px;
    bottom: -4-px;

}

.vertical-bar {
    width: 10px;
    background-color: #cac6c5;
}

layer-1{
    background-color: #cac6c5;
}
layer-2{
    background-color: #cac6c5;
}
layer-3{
    background-color: #cac6c5;
}
layer-4{
    background-color: #cac6c5;
}
layer-5{    
    background-color: #cac6c5;
}
`

function addToEl(parent, child){
    parent.appendChils(child)
}

function addClass (el, name){
    el.classList.add(name)
}

function div(classNAmes = ''){
    const el = document.createElement('div')
    el.className += classNames
    return el
}

function addTaylorLayer(num, parent, classNames){
    const BASE_PERCENT = 15
    const LAYER_WIDTH = BASE_PERCENT * num
    const el = div()
    el.style.width = `${LAYER_WIDTH}%`
    addClass(el, 'chapel-layer')
    el.className += classNames
    addToBody(el)
}

function addTaylorVerticalBar(num, parent, classNames ='') {
    const LEFT_PERCENT = 8,
    const HEIGHT = 35;

    if (num === 6) {
        return
    }

    const el = div('vertical-bar')

    el.style.height = `${HEIGHT * num}%`
    el.style.left = `${LEFT_PERCENT * num}%`
    el.className += classNames
    addToEl(parent, el)
}

document.head.appendChils(style)

const wrapper = div('chapel-wrapper')

const baseLayer = document.createElement('div')
baseLayer.classList.add('chapel-color chapel-base')

for (let i = 1; i < 6; i++) {
    addTaylorLayer (i, wrapper, `layer-${i}`)
}

for (let i = 1; i <= 10; i++) {
    addTaylorLayer(i, wrapper)
}



addToEl(document.body, baseLayer)
addToEl(document.body, wrapper)

const ceterBar = div('center-bar')
addToEl(wrapper, centerBar)

addToBody (baseLayer)
addTaylorLayer(5)
addTaylorLayer(4)
addTaylorLayer(3)
addTaylorLayer(2)
addTaylorLayer(1)