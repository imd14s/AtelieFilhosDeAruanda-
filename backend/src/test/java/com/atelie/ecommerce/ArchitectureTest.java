package com.atelie.ecommerce;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

@AnalyzeClasses(packages = "com.atelie.ecommerce", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

        @ArchTest
        static final ArchRule clean_architecture_layers = layeredArchitecture()
                        .consideringAllDependencies()
                        .layer("API").definedBy("com.atelie.ecommerce.api..")
                        .layer("Application").definedBy("com.atelie.ecommerce.application..")
                        .layer("Domain").definedBy("com.atelie.ecommerce.domain..")
                        .layer("Infrastructure").definedBy("com.atelie.ecommerce.infrastructure..")

                        .whereLayer("API").mayNotBeAccessedByAnyLayer()
                        .whereLayer("Application").mayOnlyBeAccessedByLayers("API", "Infrastructure")
                        .whereLayer("Domain").mayOnlyBeAccessedByLayers("Application", "Infrastructure", "API")
                        .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer();

        @ArchTest
        static final ArchRule domain_should_not_depend_on_other_layers = noClasses()
                        .that().resideInAPackage("com.atelie.ecommerce.domain..")
                        .should().dependOnClassesThat()
                        .resideInAnyPackage("com.atelie.ecommerce.application..", "com.atelie.ecommerce.api..",
                                        "com.atelie.ecommerce.infrastructure..");

        @ArchTest
        static final ArchRule application_should_only_depend_on_domain_or_internal = classes()
                        .that().resideInAPackage("com.atelie.ecommerce.application..")
                        .should().onlyDependOnClassesThat()
                        .resideInAnyPackage(
                                        "com.atelie.ecommerce.application..",
                                        "com.atelie.ecommerce.domain..",
                                        "com.atelie.ecommerce.api..", // Only for DTOs if shared
                                        "java..",
                                        "org.springframework..",
                                        "org.slf4j..",
                                        "lombok..",
                                        "jakarta..",
                                        "com.fasterxml.jackson..",
                                        "java.math..",
                                        "java.util..",
                                        "com.atelie.ecommerce.infrastructure.security..");

        @ArchTest
        static final ArchRule no_circular_dependencies = com.tngtech.archunit.library.dependencies.SlicesRuleDefinition
                        .slices()
                        .matching("com.atelie.ecommerce.(*)..")
                        .should().beFreeOfCycles();
}
