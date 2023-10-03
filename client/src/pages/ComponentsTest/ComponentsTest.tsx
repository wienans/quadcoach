import { Collapsible, SoftBox, SoftButton } from "../../components";
import { Gradients, GreyColors, NormalColors } from "../../components/SoftBox/SoftBoxRoot";

const ComponentsTest = (): JSX.Element => {

    return (
        <>
            <a href="https://www.creative-tim.com/learning-lab/react/box/soft-ui-dashboard/" target="_blank">Softbox Demo</a>
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
            <SoftButton variant="gradient" color="info">Button</SoftButton>
            <Collapsible
                label="Collapsible">
                Test
            </Collapsible>
        </>
    );
}

export default ComponentsTest;
