import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
} from "@chakra-ui/react";
import { ExpandedIndex } from "@chakra-ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is an NFT?",
    answer:
      "An NFT (Non-Fungible Token) is a unique digital asset stored on a blockchain. It represents ownership of a specific item, such as digital art, music, or virtual real estate. Unlike cryptocurrencies, each NFT is unique and can't be exchanged on a like-for-like basis.",
  },
  {
    question: "What is meant by minting an NFT?",
    answer:
      "Minting an NFT means creating a new token on the blockchain. It's the process of turning your digital file (like an image or video) into a blockchain asset. When you mint an NFT, you're assigning a unique identifier to your digital asset, making it verifiably one-of-a-kind on the blockchain. This process establishes authenticity, ownership, and scarcity for your digital creation.",
  },
  {
    question: "What is a Cardano Wallet and why do I need one?",
    answer:
      "A Cardano wallet is a digital wallet that allows you to store, send, and receive ADA (Cardano's cryptocurrency) and Cardano-based tokens, including NFTs. You need one to interact with the Cardano blockchain, mint NFTs, and manage your digital assets securely.",
  },
  {
    question: "What is the fee involved in minting?",
    answer:
      "Minting an NFT on Cardano involves a small fee, typically a few ADA. This fee covers the cost of processing the transaction and storing your NFT data on the blockchain. The exact amount can vary based on network conditions and the size of your NFT data.",
  },
  {
    question: "How long does it take to mint an NFT on Cardano?",
    answer:
      "Minting an NFT on Cardano usually takes a few minutes. The process involves uploading your file to IPFS, creating the token metadata, and submitting the minting transaction. Once the transaction is confirmed on the blockchain (typically within 20 seconds to a minute), your NFT is minted.",
  },
  {
    question: "Can I sell or gift my NFT after minting?",
    answer:
      "Yes, after minting your NFT on Cardano, you have full ownership and control over it. You can sell it on various Cardano NFT marketplaces, transfer it directly to a buyer's wallet as a sale, or send it to a friend's wallet as a gift. The process typically involves initiating a blockchain transaction to transfer the NFT from your wallet to another. Remember, while gifting is free (aside from transaction fees), selling may involve marketplace fees or royalties to the original creator, depending on the platform and the NFT's terms.",
  },
];

const FAQSection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<ExpandedIndex>(-1);

  const handleAccordionChange = (index: number) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? -1 : index));
  };

  return (
    <>
      <Box mt={8}>
        <Heading as="h2" size="xl" mb={4}>
          FAQ
        </Heading>
        <Accordion index={expandedIndex} onChange={() => {}}>
          <VStack spacing={4} align="stretch">
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton
                    onClick={() => handleAccordionChange(index)}
                    _expanded={{ bg: "blue.700" }}
                  >
                    {" "}
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.300">
                  <Text color="gray.900">{faq.answer}</Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </VStack>
        </Accordion>
      </Box>
    </>
  );
};

export default FAQSection;
