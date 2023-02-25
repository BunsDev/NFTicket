import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ethers } from "ethers";
import { database } from "../firebase.js";
import { ref, set } from "firebase/database";

export default class CreateEventForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: "",
      eventDescription: "",
      numGATickets: "",
      gaTicketPrice: "",
      eventId: 0,
    };

    this.handleCreate = this.handleCreate.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async handleCreate(event) {
    alert("Creating Event: " + this.state.eventName);
    event.preventDefault();

    // TODO: redirect to confirmation page
    // determine event id and create event
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const NFTicketAbi = require("../NFTicket.json").abi

    const NFTicketContract = new ethers.Contract("0xAe07D479744B6C39d6F3421D1D534B18eDCd44F6", NFTicketAbi, signer)
    const response = await NFTicketContract.createEvent(10, 10000) // price, amount
    console.log(response)
    const eventId = await NFTicketContract.getLastEventId()
    console.log("eventId: ", Number(eventId))
    this.setState({["eventId"]: Number(eventId)}, () => {
        console.log(`adding to events/${eventId} wtih state: ${JSON.stringify(this.state)}`);
        set(ref(database, "events/" + this.state.eventId), this.state);
    });


  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  render() {
    return (
      <Box
        stlye={{ justifyContent: "center", alignItems: "center" }}
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "50ch" },
        }}
        noValidate
        autoComplete="off"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TextField
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
            required
            label="Event Name"
            variant="filled"
            name="eventName"
            onChange={this.handleChange}
          />
          <TextField
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
            required
            multiline
            minRows={3}
            maxRows={10}
            label="Description"
            variant="filled"
            name="eventDescription"
            onChange={this.handleChange}
          />
          <TextField
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
            required
            label="Number of GA Tickets"
            variant="filled"
            name="numGATickets"
            onChange={this.handleChange}
          />
          <TextField
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
            required
            label="GA Ticket Price"
            variant="filled"
            name="gaTicketPrice"
            onChange={this.handleChange}
          />
          <Button
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
            variant="contained"
            onClick={this.handleCreate}
          >
            Create Event
          </Button>
        </div>
      </Box>
    );
  }
}
