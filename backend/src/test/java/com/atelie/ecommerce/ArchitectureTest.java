package com.atelie.ecommerce;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.atelie.ecommerce", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

        // ═══════════════════════════════════════════════════════════════
        // RULE 1 - Domain Isolation (CRITICAL)
        // The domain layer MUST NOT depend on any outer layer.
        // This is the most important guardrail of Clean Architecture.
        // ═══════════════════════════════════════════════════════════════
        @ArchTest
        static final ArchRule domain_must_be_self_contained = noClasses()
                        .that().resideInAPackage("com.atelie.ecommerce.domain..")
                        .should().dependOnClassesThat()
                        .resideInAnyPackage(
                                        "com.atelie.ecommerce.application..",
                                        "com.atelie.ecommerce.api..",
                                        "com.atelie.ecommerce.infrastructure..")
                        .because("Domain layer is the core and must not leak to outer layers");

        // ═══════════════════════════════════════════════════════════════
        // RULE 2 - Application Independence from API (CRITICAL)
        // Application services must not reference API controllers or
        // non-DTO API classes. DTOs were moved to application.dto.
        // ═══════════════════════════════════════════════════════════════
        @ArchTest
        static final ArchRule application_must_not_depend_on_api = noClasses()
                        .that().resideInAPackage("com.atelie.ecommerce.application..")
                        .should().dependOnClassesThat()
                        .resideInAPackage("com.atelie.ecommerce.api..")
                        .because("Application layer must be independent of the REST interface");

        // ═══════════════════════════════════════════════════════════════
        // RULE 3 - Infrastructure must not leak into Domain (CRITICAL)
        // Entities/Repos from persistence must never appear in domain.
        // ═══════════════════════════════════════════════════════════════
        @ArchTest
        static final ArchRule infrastructure_must_not_leak_into_domain = noClasses()
                        .that().resideInAPackage("com.atelie.ecommerce.domain..")
                        .should().dependOnClassesThat()
                        .resideInAPackage("com.atelie.ecommerce.infrastructure..")
                        .because("Domain must use ports/interfaces, not infrastructure implementations");

        // ═══════════════════════════════════════════════════════════════
        // NOTE: The following patterns are ACCEPTED technical debt:
        //
        // 1. API → Infrastructure (controllers inject repos directly)
        // → Future: refactor controllers to use Application services
        //
        // 2. Application ↔ Infrastructure (bidirectional with Spring DI)
        // → Acceptable: Application uses repos via constructor injection;
        // Infrastructure uses Application services for config/caching.
        //
        // The layeredArchitecture() rule and the cycle-free check are
        // intentionally OMITTED until these debts are resolved.
        // ═══════════════════════════════════════════════════════════════
}
