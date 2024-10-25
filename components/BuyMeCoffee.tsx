"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { useState } from "react";
import { prepareContractCall, toWei } from "thirdweb";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useContractEvents,
  useReadContract,
} from "thirdweb/react";
import { contract } from "../utils/contract";

export const BuyMeCoffee = () => {
  const account = useActiveAccount();

  const [tipAmount, setTipAmount] = useState(0);
  const [message, setMessage] = useState("");

  const { data: totalCoffee, refetch: refetchTotalCoffee } = useReadContract({
    contract: contract,
    method: "getTotalCoffee",
  });

  const { data: contractEvents, refetch: refetchContractCoffee } =
    useContractEvents({
      contract: contract,
    });

  const truncateWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const convertDate = (timestamp: bigint) => {
    const timestampNumber = Number(timestamp);
    return new Date(timestampNumber * 100).toLocaleString();
  };

  if (account) {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "2rem",
          borderRadius: "12px",
          width: "500px",
          backgroundColor: "black",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <ConnectButton client={client} chain={chain} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "1.5rem",
          }}
        >
          <label
            style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}
          >
            Tip Amount
          </label>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            Must be greater than 0
          </p>
          <input
            type="number"
            value={tipAmount}
            onChange={(e) => setTipAmount(Number(e.target.value))}
            step={0.01}
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              color: "white",
              marginBottom: "1rem",
            }}
          />

          <label
            style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}
          >
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message..."
            style={{
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem",
              color: "white",
              marginBottom: "1rem",
            }}
          />
          {message && tipAmount > 0 && (
            <TransactionButton
              transaction={() =>
                prepareContractCall({
                  contract: contract,
                  method: "buyMeACoffee",
                  params: [message],
                  value: BigInt(toWei(tipAmount.toString())),
                })
              }
              onTransactionConfirmed={() => {
                alert("Thank You For The Coffee");
                setTipAmount(0);
                setMessage("");
                refetchTotalCoffee();
              }}
              style={{
                backgroundColor: "#4169e1",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem",
                color: "white",
                marginBottom: "1rem",
              }}
            >
              Buy A Coffee
            </TransactionButton>
          )}
        </div>

        <div>
          <h3
            style={{
              marginTop: "1rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Total Coffee : {totalCoffee?.toString()}
          </h3>
          <p style={{ marginTop: "1rem", fontSize: "1rem", color: "#555" }}>
            Recent Coffees:
          </p>
          {contractEvents && contractEvents.length > 0 && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "black",
                borderRadius: "6px",
              }}
            >
              {[
                ...contractEvents.reverse().map((event, index) => (
                  <div
                    key={index}
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        marginTop: "0.5rem",
                      }}
                    >
                      {/* @ts-ignore */}
                      {truncateWalletAddress(event.args.sender)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#666",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {/* @ts-ignore */}
                      {convertDate(event.args.timestamp)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "white",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {/* @ts-ignore */}
                      {event.args.message}
                    </p>
                  </div>
                )),
              ]}
            </div>
          )}
        </div>
      </div>
    );
  }
};
