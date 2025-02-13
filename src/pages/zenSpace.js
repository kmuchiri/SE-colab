import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import '../styles/zenSpace.css';
import meditateIcon from '../images/meditationZenSpace.png';
import gameIcon from '../images/gamingZenSpace.png';
import Ad from "./ads.js";
import "../styles/ads.css";

const ZenSpace = () => {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [timedPopup, setTimedPopup] = useState(false);

    useEffect(() => {
        setTimeout(() => {
          setTimedPopup(true);
        }, 3000);
      }, []);

    return (
        <div>

        <div className="adPop">
            <Ad trigger={timedPopup} setTrigger={setTimedPopup}/>
         </div>

            {/* <div className="NavbarZenSpaceContainer"> */}
                <Navbar />
            {/* </div> */}
            <div className="content-containerZenSpace">
                <h1 className="titleZenSpace">How do you want to relax?</h1>
                <div className="boxes-containerZenSpace">
                    <Link to="https://ansongeo.github.io/wordgame" target="_blank" className="boxZenSpace">
                        <img src={gameIcon} alt="games icon" className="box-iconZen" />
                        <h2>Games</h2>
                    </Link>
                    <Link to="/meditation1" className="boxZenSpace">
                        <img src={meditateIcon} alt="meditation icon" className="box-iconZen" />
                        <h2>Meditation</h2>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ZenSpace;
