import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { Gradients, GreyColors, NormalColors } from "../../components/SoftBox/SoftBoxRoot";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ComponentsTest = (): JSX.Element => {

    return (
        <>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="softbox-examples"
                    id="softbox-examples"
                >
                    <SoftBox sx={{ display: "flex", flexDirection: "column" }}>
                        <SoftTypography variant="h2">Softbox</SoftTypography>
                        <a href="https://www.creative-tim.com/learning-lab/react/box/soft-ui-dashboard/" target="_blank">Original Demo</a>
                    </SoftBox>
                </AccordionSummary>
                <AccordionDetails>
                    <SoftBox
                        color="white"
                        bgColor="info"
                        variant="gradient"
                        borderRadius="lg"
                        shadow="lg"
                        opacity={1}
                        p={2}
                    >
                        Box
                    </SoftBox>
                    <SoftBox
                        color="black"
                        bgColor={Gradients.error}
                        variant="gradient"
                        borderRadius="lg"
                        shadow="lg"
                        opacity={1}
                        p={2}
                        my={2}
                    >
                        Box
                    </SoftBox>
                    <SoftBox
                        color="white"
                        bgColor="info"
                        variant="contained"
                        borderRadius="lg"
                        shadow="lg"
                        opacity={1}
                        p={2}
                        my={2}
                    >
                        Box
                    </SoftBox>
                    <SoftBox
                        color="white"
                        bgColor={GreyColors.grey400}
                        variant="contained"
                        borderRadius="lg"
                        shadow="lg"
                        opacity={1}
                        p={2}
                        my={2}
                    >
                        Box
                    </SoftBox>
                    <SoftBox
                        color="white"
                        bgColor={NormalColors.black}
                        variant="contained"
                        borderRadius="lg"
                        shadow="lg"
                        opacity={1}
                        p={2}
                        my={2}
                    >
                        Box
                    </SoftBox>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="softbutton-examples"
                    id="softbutton"
                >
                    <SoftTypography variant="h2">Softbutton</SoftTypography>
                </AccordionSummary>
                <AccordionDetails>
                    <SoftButton variant="gradient" color="info">Button</SoftButton>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="softtpyography-examples"
                    id="softtpyography-examples"
                >
                    <SoftTypography variant="h2">SoftTypography</SoftTypography>
                </AccordionSummary>
                <AccordionDetails>
                    <SoftBox sx={{ display: "flex", flexDirection: "column" }}>
                        <SoftTypography variant="h1">Heading 1</SoftTypography>
                        <SoftTypography variant="h2">Heading 2</SoftTypography>
                        <SoftTypography variant="h3">Heading 3</SoftTypography>
                        <SoftTypography variant="h4">Heading 4</SoftTypography>
                        <SoftTypography variant="h5">Heading 5</SoftTypography>
                        <SoftTypography variant="h6">Heading 6</SoftTypography>
                        <SoftTypography variant="subtitle1">Subtitle 1</SoftTypography>
                        <SoftTypography variant="subtitle2">Subtitle 2</SoftTypography>
                        <SoftTypography variant="body1">Body 1</SoftTypography>
                        <SoftTypography variant="body2">Body 2</SoftTypography>
                        <SoftTypography variant="button">Button</SoftTypography>
                        <SoftTypography variant="caption">Caption</SoftTypography>
                        <SoftTypography variant="overline">Overline</SoftTypography>
                        <SoftTypography variant="inherit">Inherit</SoftTypography>
                    </SoftBox>
                </AccordionDetails>
            </Accordion>
        </>
    );
}

export default ComponentsTest;
