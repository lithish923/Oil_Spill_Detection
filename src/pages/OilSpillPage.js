import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { useDispatch } from 'react-redux';
import { setLocation } from '../store/locationSlice';
import { IoCloseCircleOutline } from "react-icons/io5";
import Grow from '@mui/material/Grow';

function OilSpillPage() {
    const dispatch = useDispatch();
    const [oilspill_region, setOilSpillRegion] = useState([]);
    const [spillData, setSpillData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8000/ais_data")
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (result) => {
                        // Filter only spills where spill == 1
                        const filteredData = result.data.filter(item => item.spill === "1");
                        setOilSpillRegion(filteredData);
                    },
                    error: (error) => console.error("Error parsing CSV:", error)
                });
            })
            .catch((error) => console.error("Error fetching CSV:", error));
    }, []);

    const handleClick = (item) => {
        const lat = Number(item.LAT_x);
        const lon = Number(item.LON_x);

        if (isNaN(lat) || isNaN(lon)) {
            console.error("Invalid latitude or longitude:", lat, lon);
            return; // Exit function if invalid lat/lon
        }

        dispatch(setLocation({ lat, lng: lon }));
        setSpillData(item);
    };

    return (
        <div className='data-container'>
            {!spillData ? (
                oilspill_region.map((item, index) => (
                    <Grow in={true} timeout={500} style={{ transitionDelay: `${index * 50}ms` }} key={index}>
                        <div className="AISdata-container" onClick={() => handleClick(item)}>
                            <div className="AISdata-date">
                                <div className="time">
                                    {new Date(item.BaseDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="date">
                                    {new Date(item.BaseDateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <div className="AISdata-info">
                                <div className="vessel-name">{item.VesselName_x}</div>
                                <div className="vessel-location">
                                    <span className="value">Lat: {item.LAT_x}</span>
                                    <span className="value">Lon: {item.LON_x}</span>
                                </div>
                            </div>
                        </div>
                    </Grow>
                ))
            ) : (
                <div className="spill-data">
                    <div className="header">
                        <p>{spillData.VesselName_x}</p>
                        <span onClick={() => setSpillData(null)}><IoCloseCircleOutline /></span>
                    </div>
                    <div className="info">
                        <img
                            src={`http://localhost:8000/image?path=${encodeURIComponent(spillData.extracted_path)}`}
                            width="100%"
                            height="auto"
                            alt="Predicted Mask"
                        />
                        {Object.entries(spillData).map(([key, value], index) => (
                            !['extracted_path', 'path'].includes(key) && value ? (
                                key === 'BaseDateTime' ? (
                                    <div key={index}>
                                        <span className="label"><p>Time</p></span>
                                        <span className="value"><p>{new Date(value).toLocaleString()}</p></span>
                                    </div>
                                ) : (
                                    <div key={key}>
                                        <span className="label"><p>{key}</p></span>
                                        <span className="value"><p>{value}</p></span>
                                    </div>
                                )
                            ) : null
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OilSpillPage;
