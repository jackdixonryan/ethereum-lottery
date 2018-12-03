import React, { Component } from 'react';
import styled from 'styled-components';

// importing our web3-ethereum files.
import web3 from './web3.js';
import lottery from './lottery';

// we need state, so a class component. 
class App extends Component {
  // new es6 syntax thankfully eschews the constructor function, so we can declare state as an object w/o superfluous code. We need values for the manager, user, and players hashes, as well as value--the value inputted by the user, and balace--the amt. of ether in the lottery. 
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    currentUser: '',
    managerMessage: '',
  }

  // Our mount function is, confusingly, async for the purpose of calling our web3 functions without a bunch of callbacks and promises.
  async componentDidMount () {

    // This maybe takes some explaining. I've written code into our web3 files that manually hard-codes web3 to a value of false in the event that the user is on a browser without Metamask enables, so that the page doesn't render looking broken.

    // Therefore, if metamask is enabled on the browser...
    if (web3 !== false) {
      // We can get the accounts without throwing an app-crashing error.
      web3.eth.getAccounts((err, acc) => {
        // A little error handling anyway...
        if (err != null) {
          this.setState({ message: `An Error Occurred: ${err}`});
        }
        // Here, we say that if metamask was detected but the accounts array is 0, it must be the case that the user is not logged in to the extention.
        else if (acc.length === 0) {
          this.setState({ message: `Please log in to your Metamask account and refresh the page to continue.`});
        }
        // Barring all of this, the 0 index account in the accounts array is set as the currentUser's public key.
        else {
          this.setState({ currentUser: acc[0] });
        }
      });

      // Now we await the data about the manager's public key, the array of all player's public keys, and the balance presently in the lottery.
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.returnAllPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);

      // and now we set our state variables equal to these amounts.
      this.setState({ manager, players, balance });
    }
  }

  // This is our form submit function for entering the lottery.
  handleSubmit = async (event) => {

    // We set the message to pending because it takes a very long time in many cases to validate the transaction and generate a successful response.
    this.setState({ message: "Transaction is pending. This can take a while, so please be patient. :) "})

    // Now we call the lottery's enter method...
    await lottery.methods.enter()
    // and send it to the ethereum network from the address of the current user with a value, converted to Wei, of the amt of ether they submitted.
    .send({
      from: this.state.currentUser,
      value: web3.utils.toWei(this.state.value, 'ether')
    })
    // Then we return a message telling them that they're transaction was successful.
    .then(() => {
      this.setState({ message: "You are entered into the lottery! Good luck!!!!" });
    })
    // There is another case, however, where the user rejects the transaction for any number of reasons, or alt'ly experiences an error, in which case we send an error message. 
    .catch(err => {
      this.setState({ message: "The transaction was rejected. Try again." })
    });
  }

  // A function for selecting a winner of the lottery...
  selectWinner = async () => {

    this.setState({ managerMessage: "Doing some stuff, give me a hot second..."});

    await lottery.methods.pickWinner().send({
      from: this.state.currentUser
    })
    .then(() => {
      this.setState({ managerMessage: `Someone has been picked. But unless the whole contract is rewritten we can't figure out who it is.`});
    })
    .catch(err => {
      this.setState({ managerMessage: "This transaction was denied. Try again."});
    });
  }

  // Now for the render!
  render() {
    // STYLING ===========================================
    // Here's our styled components section, because I find it distasteful to style React any other way for some reason. It's like custom components married SCSS and had a child 1) beautiful enough to be on the bachelor and 2) Smart enough to never go on the bachelor. 

    // The banner displays only when the user does not have metamask on their browser.
    const Banner = styled.div`
      height: 750px; 
      width: 100%;
      z-index: 20000;
      background-color: blue;
      color: white;
      position: absolute;
      margin-top: -20px;
    `;

    // Styles the entire page with a fairly boilerplate background.
    const App = styled.div`
      margin: 0px;
      padding: 0px;
      background: linear-gradient(white, black);
      height: 800px;
    `;

    const MainContent = styled.div`
      width: 50%;
      margin: 0 auto;
      background: linear-gradient(white, whitesmoke);
      text-align: center;
      position: relative;
      top: 150px;
      padding: 30px;
      border-radius: 10px;
      img {
        width: 60%;
        margin: 0 auto;
      }
      h1 {
        font-size: 20px;
        margin-bottom: 10px;
      }
      p {
        line-height: 1.5;
      }
      button {
        outline: none;
        padding: 10px;
        background: none;
        border: 1px black solid;
        border-radius: 3px;
        margin: 10px; 
      }
    `;

    // RENDER FUNCTIONS============================================

    // this one only displays the selectWinner function if the currentUser's public key is equivalent to that of the manager.
    const IsManager = () => {
      if (this.state.currentUser === this.state.manager) {
        return (
        <div>
          <button onClick={this.selectWinner}>Select a Winner!</button>
          <p>{this.state.managerMessage}</p>
        </div>
      )
      } else {
        return <p>A manager will select a winner. Stay posted!</p>
      }
    }

    const NoMetamask = () => {
      if (web3 === false) {
        return (
          <Banner>
            <h1>You need the Metamask browser extention to view a DApp. Please install it to continue.</h1>
          </Banner>
        )
      } else {
        return <div></div>
      } 
    }
    
    return (
      <App>
        <NoMetamask/>
        <MainContent>
          <img src="https://www.ethereum.org/images/logos/ETHEREUM-LOGO_PORTRAIT_Black_small.png" alt="ethereum-logo" />
          <h1>lottery</h1>
          <p>This contract is managed by {this.state.manager}</p>
          <hr/>
          <p>
            There are currently {this.state.players.length} people entered into the lottery, competing to win {web3.utils.fromWei(this.state.balance, "ether")} ether!
          </p>
          <hr />

          <div>
            <label htmlFor="amount">Amount of ether to enter:</label>
            <input 
              type="text" 
              value={this.state.value}
              onChange={event => this.setState({value: event.target.value})}
            />
            <button onClick={this.handleSubmit}>
              Enter with {this.state.value} Ether
            </button>
          </div>

          <h3>{this.state.message}</h3>
          {/* This here is the conditional button for managers to select a winner. */}
          <IsManager />
        </MainContent>
      </App>
    );
  }
}

export default App;
