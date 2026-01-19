package com.learningapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class LearningAppApplication

fun main(args: Array<String>) {
    runApplication<LearningAppApplication>(*args)
}
