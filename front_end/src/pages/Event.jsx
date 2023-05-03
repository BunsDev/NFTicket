import React, { useEffect } from "react";
import "../styles/MyTicketsPage.css";
import Box from "@mui/material/Box";
import MintButton from "../components/MintButton";
import { useParams } from "react-router-dom";
import { getEventInfo } from "../interfaces/firebase_interface";
import { Typography } from "@mui/material";
import { blue } from "@mui/material/colors";
import { getEventImageUrl } from "../interfaces/firebase_interface";
import { mintTickets } from "../interfaces/NFTicket_interface";
import { getRemAvailTickets } from "../interfaces/NFTicket_interface";
import "../styles/Event.css"

export default function Event() {
  const { eventId } = useParams();
  const [eventInfo, setEventInfo] = React.useState({
    name: "",
    description: "",
    price: 0,
    availableTickets: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [remAvailTickets, setRemAvailTickets] = React.useState(true);

  // load image url
  const [imageUrl, setImageUrl] = React.useState("");
  useEffect(() => {
    if (imageUrl === "") {
      getEventImageUrl(eventId).then((url) => {
        setImageUrl(url);
      })
    }
  }, [imageUrl])

  // query contract for available tickets
  const loadAvailableTickets = async () => {
    const availableTickets = await getRemAvailTickets(eventId);
    setRemAvailTickets(availableTickets)
    console.log("available tickets: ", availableTickets)
  }

  const updateEventInfo = async () => {
    getEventInfo(eventId).then((eventInfo) => {
      console.log("eventInfo: ", eventInfo);
      setEventInfo({
        name: eventInfo.eventName,
        description: eventInfo.eventDescription,
        price: Number((eventInfo.gaTicketPrice * 0.0005361).toFixed(5)),
        availableTickets: remAvailTickets
      });

    });

  };

  useEffect(() => {
    loadAvailableTickets().then(() => {
      updateEventInfo();
    })
    setIsLoading(false)
  }, [remAvailTickets]);

  const handleMintTickets = async (amount) => {
    const remainingAvailTickets = await mintTickets(eventId, amount);
    setRemAvailTickets(remainingAvailTickets);

    // Fetch the latest event information from Firebase and update the state
    updateEventInfo();
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="main-contain">
      <Box
        sx={{
          width: "90%",
          marginLeft: "5%",
          marginRight: "5%",
          height: 410,
          backgroundColor: blue[100],
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
          marginTop: 5,

        }}
      >
        <div style={{ display: "flex" }}>
          <img
            id="event-image"
            alt=""
            src={imageUrl}
            width={410}
            height={410}
            justifyContent="left"
            style={{ marginTop: 20, marginBottom: 20 }}

          />
          <div>
            <div style={{ marginLeft: 70, marginTop: 45, marginRight: 70 }}>
              <Typography variant="h1" component="div" gutterBottom>
                <div style={{ color: "black", fontFamily: "Roboto", fontSize: 50, fontWeight: "bold" }} >
                  {eventInfo.name}
                </div>
              </Typography>
              <Typography variant="body1" gutterBottom>
                <div>{`Ticket Price: ${eventInfo.price} ETH`}</div>
                <div>{`Available Tickets: ${eventInfo.availableTickets}`}</div>
              </Typography>
              <Typography variant="h3" gutterBottom fontStyle="italic">
                <div className="wordwrap" style={{ color: "black", fontFamily: "Roberto" }}>

                  {eventInfo.description}

                </div>
              </Typography>
              <br />
              <MintButton
                eventId={eventId}
                //setRemAvailTickets={setRemAvailTickets}
                //remAvailTickets={remAvailTickets}
                onSuccess={handleMintTickets}
                data-test="mint-component"
              />
            </div>
          </div>
        </div>
      </Box>

      {/* <Box
        sx={{
          width: "100%",
          height: 7,
          backgroundColor: "black",

        }}
      /> */}
    </div>
  );
}
