/**import { createRoot } from "react-dom/client"
const root=createRoot(document.getElementById("root"))
root.render(<h1>Hello All members</h1>)*/

/**import{createRoot} from "react-dom/client"

createRoot(document.querySelector('#root')).render(
    <ul>
        <li>Beacuse it is a part of Full stack development</li>
        
        <li>it is need to connect with database</li>
    </ul>
)*/
/** CREATE ELEMENT
 * import { createElement } from "react";
import{ createRoot} from "react-dom/client"
const root=createRoot(document.querySelector("#root"))

const RooElement=createElement("h1",null,"Hello for All members")
console.log(RooElement)
root.render(
    RooElement
)*/
/** JSX
 * import{createRoot} from "react-dom/client"
const root=createRoot(document.querySelector('#root'))
const RooElement=<h1>Hello Everybody From Sharpsell</h1>
console.log(RooElement)

root.render(
    RooElement
)*/

/**import{createRoot}from "react-dom/client"
const root=createRoot(document.getElementById('root'))
const Rac=<h1>Hello from JSXJSX</h1>
console.log(Rac)

root.render(
    Rac
)*/

/** USING FUNCTION
import { createRoot } from "react-dom/client"
const root=createRoot(document.getElementById('root'))
function Header(){
return(
        <section>
        <h1>
         This is My page
        </h1>
        <ul>
            <li>Beacuse iT is one of The imp in Full stack development</li>
            <li>now iT should learn to connect with database</li>
        </ul>
        </section>
    )
}
root.render(
    <Header />
) */

   /** Cusomize <Components-parents/childs
     import { createRoot } from "react-dom/client"
    import { Fragment } from "react"
    import Header from "/app"
    const root=createRoot(document.getElementById('root'))

    
    function Page(props){
    return(
            <section>
                <Header />
                <h3>{props.name}</h3>
      
            <ul>
                <li>Beacuse iT is one of The imp in Full stack development</li>
                <li>now iT should learn to connect with database</li>
            </ul>
            </section>
        )
    }

    const persons = {
        name:"hanuma"
    }
    root.render(
        < Page {...persons}/>
)
*/

/**import ReactDOM from "react-dom/client";

import React from "react";
function App(){
function signup(formData){
   
    const email= formData.get("email")
    console.log(email)
    
}

    return(
        <section>
    
            <h2>signUp</h2>
            <form action={signup}>
            <label>Email:</label>
            <input id="email"type="email"placeholder="hanuma@gmail.com"/><br />
            <hr />
            <label>password:</label>
            <input id="password" type="password"placeholder="password"/><br />
            <hr />
            <button>submit</button>
            </form>
        </section>
    )

}
    export default defineConfig({
  plugins: [react()],
});

ReactDOM.createRoot(document.getElementById('root')).render(<App />)*/


import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
if(container){
const root = createRoot(container);

root.render(
 <BrowserRouter>
    <App />
</BrowserRouter>
);
}else{
    console.error('Failed to find the root element');
}
