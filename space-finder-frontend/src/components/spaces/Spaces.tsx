import { useState, useEffect, JSX } from "react";
import SpaceComponent from "./SpaceComponent";
import { DataService } from "../../services/DataService";
import { NavLink } from "react-router-dom";
import { SpaceEntry } from "../model/model";

interface SpacesProps {
    dataService: DataService
}

export default function Spaces(props: SpacesProps){

    const [spaces, setSpaces] = useState<SpaceEntry[]>();
    const [reservationText, setReservationText] = useState<string>();

    useEffect(()=>{
        const getSpaces = async ()=>{
            console.log('getting spaces....')
            const spaces = await props.dataService.getSpaces();
            console.log('spaces raw format:', JSON.stringify(spaces, null, 2));
            console.log('spaces:', spaces);

            setSpaces(spaces);
        }
        getSpaces();
    }, [])

    async function reserveSpace(spaceId: string, spaceName: string){
        const reservationResult = await props.dataService.reserveSpace(spaceId);
        setReservationText(`You reserved ${spaceName}, reservation id: ${reservationResult}`);
    }

    

    function renderSpaces(){
        if(!props.dataService.isAuthorized()) {
            return<NavLink to={"/login"}>Please login</NavLink>
        }
        if (!spaces || spaces.length === 0) {
            return <div>No spaces found</div>;
        }
        
        return spaces.map(spaceEntry => (
            <SpaceComponent 
                key={spaceEntry.id}
                id={spaceEntry.id}
                location={spaceEntry.location}
                name={spaceEntry.name}
                photoUrl={spaceEntry.photoUrl}
                reserveSpace={reserveSpace}
            />
        ));
    }

    return (
        <div>
            <h2>Welcome to the Spaces page!</h2>
            {reservationText? <h2>{reservationText}</h2>: undefined}
            {renderSpaces()}
        </div>
    )        
    

}