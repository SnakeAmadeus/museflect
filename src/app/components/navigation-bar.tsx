import React from 'react';
import {
    PinesUINavigationMenu,
    PinesUINavigationMenuItem,
    PinesUINavigationMenuPanel,
    PinesUINavigationMenuPanelColumn,
    PinesUINavigationMenuPanelItem,
    PinesUINavigationMenuBrand
} from './pines-ui-react/pines-ui-navigation-menu';

const NavigationMenuExample = () => {
    return (
        <PinesUINavigationMenu toggleType="hover">
            <PinesUINavigationMenuItem
                id="getting-started"
                label="Getting started"
            >
                <PinesUINavigationMenuPanel>
                    <PinesUINavigationMenuBrand className="w-48 rounded pt-28 pb-7 bg-gradient-to-br from-neutral-800 to-black">
                        <div className="relative px-7 space-y-1.5 text-white">
                            <svg
                                className="block w-auto h-9"
                                viewBox="0 0 180 180"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M67.683 89.217h44.634l30.9 53.218H36.783l30.9-53.218Z"
                                    fill="currentColor"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M77.478 120.522h21.913v46.956H77.478v-46.956Zm-34.434-29.74 45.59-78.26 46.757 78.26H43.044Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="block font-bold text-left">
                                Pines UI
                            </span>
                            <span className="block text-sm opacity-60 text-left">
                                An Alpine and Tailwind UI library
                            </span>
                        </div>
                    </PinesUINavigationMenuBrand>

                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="Introduction"
                            description="Re-usable elements built using Alpine JS and Tailwind CSS."
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="How to use"
                            description="Couldn't be easier. It is as simple as copy, paste, and preview."
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Contributing"
                            description="Feel free to contribute your expertise. All these elements are open-source."
                            children={undefined}
                        />
                    </PinesUINavigationMenuPanelColumn>
                </PinesUINavigationMenuPanel>
            </PinesUINavigationMenuItem>

            <PinesUINavigationMenuItem id="learn-more" label="Learn More">
                <PinesUINavigationMenuPanel>
                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="Tailwind CSS"
                            description="A utility first CSS framework for building amazing websites."
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Laravel"
                            description="The perfect all-in-one framework for building amazing apps."
                            href="#_"
                            onClick={undefined}
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Pines UI"
                            description="An Alpine JS and Tailwind CSS UI library for awesome people."
                            href="#_"
                            onClick={undefined}
                            children={undefined}
                        />
                    </PinesUINavigationMenuPanelColumn>

                    <PinesUINavigationMenuPanelColumn>
                        <PinesUINavigationMenuPanelItem
                            title="AlpineJS"
                            description="A framework without the complex setup or heavy dependencies."
                            href="#_"
                            onClick={undefined}
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Livewire"
                            description="A seamless integration of server-side and client-side interactions."
                            href="#_"
                            onClick={undefined}
                            children={undefined}
                        />
                        <PinesUINavigationMenuPanelItem
                            title="Tails"
                            description="The ultimate Tailwind CSS design tool that helps you craft beautiful websites."
                            href="#_"
                            onClick={undefined}
                            children={undefined}
                        />
                    </PinesUINavigationMenuPanelColumn>
                </PinesUINavigationMenuPanel>
            </PinesUINavigationMenuItem>

            <PinesUINavigationMenuItem
                label="Documentation"
                href="#_"
                children={undefined}
                id={undefined}
            />
        </PinesUINavigationMenu>
    );
};

export default NavigationMenuExample;
