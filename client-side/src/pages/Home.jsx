import React from "react";
import { Link } from "react-router-dom";


function Home() {
    return (
<div id="carouselData" class="carousel slide container p-0" data-ride="carousel">
    <div class="carousel-inner">
        <div class="carousel-item active">
            <img class="d-block w-100" src="" alt="First slide"/>
        </div>
        <div class="carousel-item">
            <img class="d-block w-100" src="img/sus.jpg" alt="Second slide"/>
        </div>
        <div class="carousel-item">
            <img class="d-block w-100" src="img/home.png" alt="Third slide"/>
        </div>
    </div>
    <a class="carousel-control-prev" href="#carouselData" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#carouselData" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
    </a>
</div>

);
}

export default Home;